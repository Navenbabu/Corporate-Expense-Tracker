/*
  # Corporate Expense Tracker Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `expenses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `amount` (numeric)
      - `date` (date)
      - `category_id` (uuid, foreign key)
      - `description` (text)
      - `status` (text)
      - `receipt_url` (text)
      - `submitted_by` (uuid, foreign key)
      - `submitted_at` (timestamp)
      - `reviewed_by` (uuid, foreign key)
      - `reviewed_at` (timestamp)
      - `comments` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Categories:
      - Everyone can read categories
      - Only admins can modify categories
    - Expenses:
      - Users can read their own expenses
      - Managers can read all expenses
      - Users can create and update their own draft/rejected expenses
      - Managers can update expense status and add comments
*/

-- Create expense status enum
CREATE TYPE expense_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected'
);

-- Create expense categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  category_id uuid REFERENCES categories(id),
  description text NOT NULL,
  status expense_status NOT NULL DEFAULT 'draft',
  receipt_url text,
  submitted_by uuid REFERENCES auth.users(id) NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Categories are modifiable by admins only"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Expenses policies
CREATE POLICY "Users can view their own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'manager' OR
        auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Users can create their own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can update their own draft or rejected expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    submitted_by = auth.uid() AND
    status IN ('draft', 'rejected')
  )
  WITH CHECK (
    submitted_by = auth.uid() AND
    status IN ('draft', 'rejected')
  );

CREATE POLICY "Managers can update expense status and comments"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'manager' OR
        auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'manager' OR
        auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Insert default categories
INSERT INTO categories (name, description)
VALUES
  ('travel', 'Transportation expenses including flights, trains, and taxis'),
  ('meals', 'Business meals and entertainment expenses'),
  ('accommodation', 'Hotel and lodging expenses'),
  ('equipment', 'Office equipment and hardware purchases'),
  ('office', 'Office supplies and general expenses'),
  ('other', 'Miscellaneous business expenses')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();