# Sipology Supabase setup (private owner dashboard)

This project uses Supabase Auth + Postgres. The browser only receives the public anon/publishable key; never put the service-role key in this project.

## 1) Create your Supabase project
- Create a project at https://supabase.com and keep the database password safe.
- In Project Settings > API, copy the Project URL and the anon/public key (or publishable key). Do NOT use the service-role/secret key.

## 2) Create the first admin login
- In Authentication > Users, add/create a user with your email and a strong password. Disable public sign-ups in Auth settings.
- In the Supabase SQL Editor, run the contents of `supabase/setup.sql`.
- Copy the UUID of the user you created from Auth > Users.
- Run the following in SQL Editor, replacing the UUID:

```sql
insert into public.admin_users(user_id) values ('YOUR-AUTH-USER-UUID');
```

This allowlists that account for admin access. Do not add other user IDs unless they should have admin privileges.

## 3) Configure Vercel
In Vercel Project Settings > Environment Variables, add for Production, Preview and Development as needed:
- `VITE_SUPABASE_URL` = your project URL
- `VITE_SUPABASE_ANON_KEY` = your public anon/publishable key

These values are intentionally public browser credentials. RLS is what protects data. Do not add the service-role key here or in Git.

## 4) Deploy
- Commit the project files.
- Vercel build command: `npm run build`; output directory: `dist`.
- Redeploy after adding environment variables.
- Open `/admin.html`, sign in with the allowlisted admin account and edit menu/profile.

## 5) Security notes
- `admin_users` has no public write policy. Admin membership must be added through trusted SQL/admin tooling.
- Menu and cafe profile tables have RLS policies. Public access is limited to reading active menu items and cafe profile.
- Use a strong unique admin password and MFA if available. Do not share the account.
- Rotate credentials if ever accidentally exposed. Review Vercel environment variables and Git history for secrets.
- This scaffold is not a substitute for a full security audit.
