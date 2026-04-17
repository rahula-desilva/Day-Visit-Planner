import { supabase } from "./supabase";

/**
 * SIGN UP
 * Creates a new user in Supabase Auth.
 * The 'username' is passed in the metadata so the database trigger can pick it up.
 */
export const signUpUser = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username, // This name must match what we used in the SQL trigger
      },
    },
  });

  return { data, error };
};

/**
 * SIGN IN
 * Authenticates an existing user.
 */
export const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

/**
 * SIGN OUT
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * GET SESSION
 * Checks if the user is currently logged in.
 */
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
