export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};
