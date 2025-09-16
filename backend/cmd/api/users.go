package main

import (
	"errors"
	"net/http"
	"stockcast/internal/store"
	"time"
)

func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Name     string `json:"name" validate:"required"`
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,max=16"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := &store.User{
		Name:      payload.Name,
		Email:     payload.Email,
		Activated: false,
	}

	err = user.Password.Set(payload.Password)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.store.Users.Create(r.Context(), user)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrDuplicateEmail):
			app.badRequestResponse(w, r, store.ErrDuplicateEmail)
			return
		default:
			app.serverErrorResponse(w, r, err)
			return
		}
	}

	app.logger.Info("User created", map[string]any{
		"userID": user.ID,
		"email":  user.Email,
	})

	token, err := app.store.Tokens.New(r.Context(), user.ID, 3*24*time.Hour, store.ScopeActivation)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.background(func() {
		data := map[string]any{
			"activationToken": token.Plaintext,
			"userID":          user.ID,
		}
		err = app.mailer.Send(user.Email, "user_welcome.tmpl", data)
		if err != nil {
			app.logger.Error(err, nil)
		}
	})

	err = app.writeJSON(w, http.StatusAccepted, envelope{"user": user, "token": token}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) activateUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		TokenPlainText string `json:"token" validate:"required"`
	}
	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user, err := app.store.Users.GetForToken(r.Context(), store.ScopeActivation, payload.TokenPlainText)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrorNotFound):
			app.badRequestResponse(w, r, err)
			return
		default:
			app.serverErrorResponse(w, r, err)
			return
		}
	}

	user.Activated = true

	err = app.store.Users.Update(r.Context(), user)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrEditConflict):
			app.editConflictResponse(w, r)
			return
		default:
			app.serverErrorResponse(w, r, err)
			return
		}
	}

	err = app.store.Tokens.DeleteAllForUser(r.Context(), store.ScopeActivation, user.ID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"user": user}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
