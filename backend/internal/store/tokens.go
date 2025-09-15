package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base32"
	"log/slog"
	"time"
)

const (
	ScopeActivation     = "activation"
	ScopeAuthentication = "authentication"
	ScopePasswordReset  = "password-reset"
)

type Token struct {
	Plaintext string    `json:"token"`
	Hash      []byte    `json:"-"`
	UserID    int64     `json:"-"`
	Expiry    time.Time `json:"expiry"`
	Scope     string    `json:"-"`
}

func generateToken(userID int64, ttl time.Duration, scope string) (*Token, error) {
	token := &Token{
		UserID: userID,
		Expiry: time.Now().Add(ttl),
		Scope:  scope,
	}

	slog.Info("Generating token", "userID", userID, "ttl", ttl, "scope", scope)

	randomBytes := make([]byte, 16)

	_, err := rand.Read(randomBytes)
	if err != nil {
		return nil, err
	}
	// encode randomBytes to a Base32 encoded string and assign it to plainText
	// default base-32 encoding may end with = character , so use WithPadding(base32.NoPadding) removes it
	token.Plaintext = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(randomBytes)

	// sha256.Sum256 generates an array of length 32 of type byte
	hash := sha256.Sum256([]byte(token.Plaintext))
	token.Hash = hash[:]

	slog.Info("Generated token", "userID", userID, "ttl", ttl, "scope", scope, "plaintext", token.Plaintext, "hash", token.Hash)

	return token, nil
}

type TokenStore struct {
	DB *sql.DB
}

func (s *TokenStore) New(ctx context.Context, userID int64, ttl time.Duration, scope string) (*Token, error) {
	slog.Info("Generating new token", "userID", userID, "ttl", ttl, "scope", scope)
	token, err := generateToken(userID, ttl, scope)
	if err != nil {
		return nil, err
	}
	err = s.Create(ctx, token)
	return token, err
}

func (s *TokenStore) Create(ctx context.Context, token *Token) error {
	query := `
		INSERT INTO tokens (hash , user_id , expiry , scope)
		VALUES ($1 , $2 , $3 , $4)
	`
	args := []any{token.Hash, token.UserID, token.Expiry, token.Scope}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := s.DB.ExecContext(ctx, query, args...)
	return err
}

func (s *TokenStore) DeleteAllForUser(ctx context.Context, scope string, userID int64) error {
	query := `
		DELETE FROM tokens
		WHERE scope = $1 AND user_id = $2
	`
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := s.DB.ExecContext(ctx, query, scope, userID)
	return err
}
