CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password                VARCHAR(255),
    auth_provider           VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    email_verified          BOOLEAN NOT NULL DEFAULT TRUE,
    google_id               VARCHAR(255),
    avatar                  VARCHAR(1024),
    biz_gstin               VARCHAR(32),
    biz_business_name       VARCHAR(255),
    biz_trade_name          VARCHAR(255),
    biz_registration_type   VARCHAR(64),
    biz_state               VARCHAR(128),
    biz_state_code          VARCHAR(16),
    biz_address             VARCHAR(1024),
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_google_id ON users (google_id);

CREATE TABLE pending_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    otp           VARCHAR(10) NOT NULL,
    otp_expires   TIMESTAMP NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_users_email ON pending_users (email);

CREATE TABLE parties (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    gstin       VARCHAR(32),
    phone       VARCHAR(32),
    email       VARCHAR(255),
    address     VARCHAR(1024),
    state_code  VARCHAR(16),
    type        VARCHAR(10) NOT NULL DEFAULT 'B2B',
    status      VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_parties_user_id ON parties (user_id);

CREATE TABLE transporters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    gstin           VARCHAR(32),
    phone           VARCHAR(32),
    email           VARCHAR(255),
    address         VARCHAR(1024),
    state_code      VARCHAR(16),
    vehicle_number  VARCHAR(32),
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_transporters_user_id ON transporters (user_id);

CREATE TABLE stock_items (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                  VARCHAR(255) NOT NULL,
    sku                   VARCHAR(128),
    hsn                   VARCHAR(32),
    quantity              NUMERIC(14, 2) NOT NULL DEFAULT 0,
    price                 NUMERIC(14, 2) NOT NULL,
    gst_rate              NUMERIC(5, 2) NOT NULL DEFAULT 18,
    gst_type              VARCHAR(10) NOT NULL DEFAULT 'IGST',
    is_inclusive          BOOLEAN NOT NULL DEFAULT FALSE,
    low_stock_threshold   NUMERIC(14, 2) NOT NULL DEFAULT 10,
    created_at            TIMESTAMP NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_items_user_id ON stock_items (user_id);

CREATE TABLE invoices (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    invoice_number        VARCHAR(64) NOT NULL,
    type                  VARCHAR(10) NOT NULL DEFAULT 'B2B',
    customer_name         VARCHAR(255) NOT NULL,
    customer_gstin        VARCHAR(32),
    customer_phone        VARCHAR(32),
    customer_address      VARCHAR(1024),
    transporter_name      VARCHAR(255),
    transporter_gstin     VARCHAR(32),
    transporter_phone     VARCHAR(32),
    transporter_address   VARCHAR(1024),
    vehicle_number        VARCHAR(32),
    subtotal              NUMERIC(14, 2) NOT NULL DEFAULT 0,
    gst_amount            NUMERIC(14, 2) NOT NULL DEFAULT 0,
    cgst                  NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sgst                  NUMERIC(14, 2) NOT NULL DEFAULT 0,
    igst                  NUMERIC(14, 2) NOT NULL DEFAULT 0,
    is_igst               BOOLEAN NOT NULL DEFAULT FALSE,
    is_inter_state        BOOLEAN NOT NULL DEFAULT FALSE,
    total                 NUMERIC(14, 2) NOT NULL DEFAULT 0,
    round_off_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status                VARCHAR(12) NOT NULL DEFAULT 'PENDING',
    notes                 VARCHAR(2048),
    invoice_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at            TIMESTAMP NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_invoice_user_number UNIQUE (user_id, invoice_number)
);

CREATE INDEX idx_invoices_user_id ON invoices (user_id);

CREATE TABLE invoice_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id    UUID NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
    stock_id      UUID REFERENCES stock_items (id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    hsn           VARCHAR(32),
    qty           NUMERIC(14, 2) NOT NULL DEFAULT 1,
    price         NUMERIC(14, 2) NOT NULL DEFAULT 0,
    gst_rate      NUMERIC(5, 2) NOT NULL DEFAULT 18,
    is_inclusive  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_stock_id ON invoice_items (stock_id);
