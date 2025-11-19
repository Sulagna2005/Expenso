# TODO: Fix User Authentication, Profile, and Currency Issues

## Backend Changes
- [ ] Update authentication/views.py: Use UserRegistrationSerializer in register_user view, remove username requirement, set username=email automatically.
- [ ] Ensure update_user_profile correctly updates currency on country change (already seems done, verify).
- [ ] Confirm profile_setup_complete logic in complete_profile_setup.

## Frontend Changes
- [ ] Remove username field from AuthPage.jsx registration form.
- [ ] Ensure ProfileSetup is required: Add logic to redirect to ProfileSetup if profile_setup_complete is false after login.

## Testing
- [ ] Test registration: Ensure unique credentials per user, currency set based on country.
- [ ] Test login: Verify profile matches credentials.
- [ ] Test profile update: Currency changes with country.
- [ ] Test ProfileSetup: Required for each user, fields filled manually.
