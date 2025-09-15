package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func (app *application) serve() error {
	srv := &http.Server{
		Addr:         app.cfg.addr,
		Handler:      app.mount(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	shutdownError := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)

		// if there is a SIGNAL INTERRUPT or SIGNAL TERMINATE made then
		// sends the OS SIGNAL to quit channel
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

		// blocked until quit is notified
		// runs only when quit channel receives a signal
		sig := <-quit

		app.logger.Info(" shutting down server ", map[string]string{
			"signal": sig.String(),
		})

		// gives 20 Second for all the background task to complete
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		app.logger.Info("completing background tasks ", map[string]string{
			"addr": srv.Addr,
		})
		// wait for all the background go routines to finish
		app.wg.Wait()

		shutdownError <- srv.Shutdown(ctx)
	}()

	app.logger.Info("starting server", map[string]string{
		"addr": srv.Addr,
		"env":  app.cfg.env,
	})

	err := srv.ListenAndServe()

	// because srv.Shutdown() returns http.ErrServerClosed
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	err = <-shutdownError
	if err != nil {
		return err
	}

	app.logger.Info("stopped server", map[string]string{
		"addr": srv.Addr,
	})
	return nil
}
