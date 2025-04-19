/**
 * Esquema de la base de datos para los conectores y tareas ejecutadas
 * 
 * Este archivo define las tablas necesarias en Supabase para almacenar
 * las credenciales de los conectores y el registro de tareas ejecutadas.
 */

-- Tabla para credenciales de redes sociales
CREATE TABLE social_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  platform_user_id TEXT,
  page_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, platform)
);

-- Tabla para credenciales de email marketing
CREATE TABLE email_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('mailchimp', 'sendgrid', 'convertkit', 'mailerlite')),
  api_key TEXT NOT NULL,
  server_prefix TEXT,
  platform_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, platform)
);

-- Tabla para tareas ejecutadas
CREATE TABLE executed_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('social_post', 'social_schedule', 'social_metrics', 'email_campaign', 'email_subscriber', 'email_metrics')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  parameters JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX social_credentials_user_id_idx ON social_credentials (user_id);
CREATE INDEX email_credentials_user_id_idx ON email_credentials (user_id);
CREATE INDEX executed_tasks_user_id_idx ON executed_tasks (user_id);
CREATE INDEX executed_tasks_status_idx ON executed_tasks (status);
CREATE INDEX executed_tasks_task_type_idx ON executed_tasks (task_type);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar el campo updated_at
CREATE TRIGGER update_social_credentials_updated_at
BEFORE UPDATE ON social_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_credentials_updated_at
BEFORE UPDATE ON email_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executed_tasks_updated_at
BEFORE UPDATE ON executed_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar el campo completed_at cuando el estado cambia a 'completed'
CREATE OR REPLACE FUNCTION update_completed_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el campo completed_at
CREATE TRIGGER update_executed_tasks_completed_at
BEFORE UPDATE ON executed_tasks
FOR EACH ROW
EXECUTE FUNCTION update_completed_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE social_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE executed_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para social_credentials
CREATE POLICY "Users can view their own social credentials"
ON social_credentials FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social credentials"
ON social_credentials FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social credentials"
ON social_credentials FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social credentials"
ON social_credentials FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para email_credentials
CREATE POLICY "Users can view their own email credentials"
ON email_credentials FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email credentials"
ON email_credentials FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email credentials"
ON email_credentials FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email credentials"
ON email_credentials FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para executed_tasks
CREATE POLICY "Users can view their own executed tasks"
ON executed_tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own executed tasks"
ON executed_tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own executed tasks"
ON executed_tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own executed tasks"
ON executed_tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
