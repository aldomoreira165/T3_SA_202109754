DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'environment_enum') THEN
      CREATE TYPE environment_enum AS ENUM ('DEV','QA','PROD');
   END IF;
END$$;

CREATE TABLE IF NOT EXISTS types (
  type_id          SERIAL       PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  mandatory_fields JSONB        NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS cis (
  ci_id               SERIAL             PRIMARY KEY,
  type_id             INTEGER            NOT NULL
    REFERENCES types(type_id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  name                VARCHAR(200)       NOT NULL,
  description         TEXT,
  serial_number       VARCHAR(100),
  version             VARCHAR(50),
  acquisition_date    DATE,
  status              VARCHAR(50),
  physical_location   VARCHAR(100),
  owner               VARCHAR(100),
  environment         environment_enum   NOT NULL DEFAULT 'DEV',
  security_level      VARCHAR(50),
  license_number      VARCHAR(100),
  license_expiration  DATE
);

CREATE TABLE IF NOT EXISTS hierarchies (
  hierarchy_id    SERIAL       PRIMARY KEY,
  parent_id       INTEGER      NOT NULL
    REFERENCES cis(ci_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  child_id        INTEGER      NOT NULL
    REFERENCES cis(ci_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  hierarchy_type  VARCHAR(50)  NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  document_id   SERIAL     PRIMARY KEY,
  ci_id         INTEGER    NOT NULL
    REFERENCES cis(ci_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  document_url  TEXT       NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_log_id  SERIAL                 PRIMARY KEY,
  ci_id         INTEGER                NOT NULL
    REFERENCES cis(ci_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  changed_at    TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  changed_by    VARCHAR(100)           NOT NULL,
  field_name    VARCHAR(100)           NOT NULL,
  old_value     TEXT,
  new_value     TEXT
);


-- carga inicial

INSERT INTO types (name, mandatory_fields)
VALUES
  ('Servidor', '["serial_number","environment"]'),
  ('Base de datos', '["version","acquisition_date"]'),
  ('Aplicación', '["version","owner"]')
ON CONFLICT DO NOTHING;

INSERT INTO cis (
  type_id,
  name,
  description,
  serial_number,
  version,
  acquisition_date,
  status,
  physical_location,
  owner,
  environment
) VALUES (
  1,                                  
  'WebServer-01',                     
  'Servidor web principal',           
  'SN-WS-0001',                      
  'v1.2.3',                           
  '2023-07-15',                       
  'Activo',                           
  'DataCenter A - Rack 12',       
  'Equipo Infraestructura',   
  'PROD' 
)
RETURNING *;
