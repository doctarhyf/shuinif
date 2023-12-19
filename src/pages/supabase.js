import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = "https://ltvavdcgdrfqhlfpgkks.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmF2ZGNnZHJmcWhsZnBna2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA1NzEwMjUsImV4cCI6MjAwNjE0NzAyNX0.nAuA5lILpr3giK0fiurM0DprdD1JAf4xgam0laMGfRU";

const supabaseUrl = PROJECT_URL;
const supabaseKey = ANON;
const supabase = createClient(supabaseUrl, supabaseKey);

export const CURRENT_LOGGED_IN_USER = "shuinif_user";

export function LoggedInUser() {
  let user = false;

  return localStorage.getItem(CURRENT_LOGGED_IN_USER);
}

export function Logout() {
  /*
origin
: 
"http://localhost:5173"
pathname
: 
"/shuinif/sched"
*/

  localStorage.removeItem(CURRENT_LOGGED_IN_USER);
  window.location =
    window.location.origin + "/" + window.location.pathname.split("/")[1] + "/";
}

export async function Login(phone, password) {
  let user;
  user = localStorage.getItem(CURRENT_LOGGED_IN_USER);

  if (user) {
    console.log(
      "There is a logged in user already ... Trying to log in with new creds ... \n \n ",
      user
    );
    Logout();
  }

  console.log("Login", phone, password, supabase);

  let res = await supabase
    .from("users_")
    .select("*")
    .eq("phone", phone)
    .eq("password", password);

  if (res.error) {
    return res.error;
  }

  if (res.data.length === 0) {
    return { error: true, message: "No user found!" };
  }

  console.log("res", res);

  user = res.data[0];
  user.last_login = new Date();
  localStorage.setItem(CURRENT_LOGGED_IN_USER, JSON.stringify(user));

  console.log("logged in user => ", user);

  return user;
}
