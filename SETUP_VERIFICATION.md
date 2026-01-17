# Setup Verification Checklist

Use this checklist to ensure your Commodities Earth platform is properly configured and ready to use.

## ✅ Pre-Setup Verification

### System Requirements
- [ ] Node.js 18 or higher installed
  ```bash
  node --version  # Should show v18.x.x or higher
  ```
- [ ] npm installed
  ```bash
  npm --version
  ```
- [ ] Git installed (optional, for version control)
  ```bash
  git --version
  ```

## ✅ Installation Verification

### Dependencies
- [ ] All npm packages installed without errors
  ```bash
  npm install
  # Should complete without errors
  ```
- [ ] node_modules folder exists
  ```bash
  ls node_modules  # Should show many packages
  ```

### Build Test
- [ ] Project builds successfully
  ```bash
  npm run build
  # Should complete with "✓ Compiled successfully"
  ```

## ✅ Supabase Configuration

### Project Created
- [ ] Supabase account created at supabase.com
- [ ] New project created
- [ ] Project is fully provisioned (not in "Setting up" status)

### Database Schema
- [ ] SQL script (`supabase_schema.sql`) executed successfully
- [ ] All 9 tables created:
  - [ ] users
  - [ ] demo_requests
  - [ ] commodity_locations
  - [ ] companies
  - [ ] storage_facilities
  - [ ] maritime_cargo
  - [ ] producers
  - [ ] contracts
  - [ ] reserves_by_country

### Verify Tables in Supabase Dashboard
1. Go to **Table Editor** in Supabase dashboard
2. You should see all 9 tables listed
3. Check that `companies` table has 10 rows
4. Check that `commodity_locations` table has 7 rows

### Test User Created
- [ ] User created in **Authentication** > **Users**
  - Email: raphou.monges83@gmail.com
  - Auto-confirm checked
  - User status shows as "Confirmed"

### API Keys Retrieved
- [ ] Project URL copied from **Settings** > **API**
- [ ] Anon key copied from **Settings** > **API**

## ✅ Environment Variables

### File Configuration
- [ ] `.env.local` file exists in project root
- [ ] File contains both variables:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- [ ] No quotes around values
- [ ] No spaces around `=` sign
- [ ] URLs start with `https://`
- [ ] Keys start with `eyJ`

### Verification Command
```bash
# Check if environment variables are set (run in project root)
cat .env.local

# Should output your Supabase URL and key
```

## ✅ Development Server

### Server Starts
- [ ] Dev server starts without errors
  ```bash
  npm run dev
  ```
- [ ] Console shows: "Ready in X ms"
- [ ] Console shows: "Local: http://localhost:3000"

### No Error Messages
- [ ] No red error messages in terminal
- [ ] No TypeScript errors
- [ ] No module not found errors

## ✅ Landing Page Tests

### Page Loads
- [ ] Visit http://localhost:3000
- [ ] Page loads within 3 seconds
- [ ] No errors in browser console (F12 > Console tab)

### Header
- [ ] "Commodities Earth" logo displays (top-left)
- [ ] "Pricing" link displays (center)
- [ ] "Log In" button displays (top-right)
- [ ] "Request a Demo" button displays (top-right)

### Hero Section
- [ ] Main heading displays: "Commodities Platform for Producers and Traders"
- [ ] Subtitle displays: "World Energy, Metals and Agriculture Producers Analytics"
- [ ] Earth gradient effect visible on right side

### Value Section
- [ ] Four cards display with icons and descriptions
- [ ] Cards have green borders
- [ ] Text is readable

### Pricing Section
- [ ] "€599/month" price displays
- [ ] "Request a Demo" button works
- [ ] "Contact Us" link works

### Footer
- [ ] "Commodities Earth" displays on left
- [ ] Contact email displays: ram2315@columbia.edu
- [ ] Address displays: 116th Broadway, New York

## ✅ Authentication Tests

### Login Modal
- [ ] Click "Log In" button in header
- [ ] Modal popup appears
- [ ] Modal has dark blue/green styling
- [ ] Email and password fields present
- [ ] "Log In" button present
- [ ] Can close modal with X button

### Login Functionality
- [ ] Enter email: raphou.monges83@gmail.com
- [ ] Enter password: Azerty12
- [ ] Click "Log In"
- [ ] No error message appears
- [ ] Redirects to /platform page
- [ ] Login completes within 2 seconds

### Login Error Handling
- [ ] Try wrong password
- [ ] Error message displays in red
- [ ] Can try again after error

## ✅ Demo Request Tests

### Page Access
- [ ] Click "Request a Demo" from landing page
- [ ] Navigates to /request-demo
- [ ] Form displays correctly

### Form Fields
- [ ] Company field works
- [ ] First name field works
- [ ] Last name field works
- [ ] Phone field works
- [ ] Email field works
- [ ] Message textarea works

### Calendar
- [ ] Date picker displays
- [ ] Can only select future dates
- [ ] Cannot select weekends
- [ ] Selecting Saturday/Sunday shows error
- [ ] Can select Monday-Friday

### Time Slots
- [ ] Time dropdown populates
- [ ] Shows slots from 9:00 to 18:30
- [ ] 30-minute intervals
- [ ] Can select any slot

### Form Submission
- [ ] Fill all required fields
- [ ] Select date and time
- [ ] Click "Submit Demo Request"
- [ ] Success message displays
- [ ] Can return to home

### Database Verification
- [ ] Go to Supabase **Table Editor** > **demo_requests**
- [ ] Your test entry appears
- [ ] All fields populated correctly

## ✅ Platform Tests

### Platform Access
- [ ] Navigate to /platform (must be logged in)
- [ ] Platform loads within 2 seconds
- [ ] No errors in console

### Layout
- [ ] Menu button (☰) displays top-left
- [ ] "Commodities Earth" logo displays top-left
- [ ] Page has dark blue background

### Sidebar
- [ ] Click menu button
- [ ] Sidebar opens from left
- [ ] Shows 4 navigation items:
  - [ ] Earth Map
  - [ ] Commodities Options
  - [ ] Commodities Futures
  - [ ] Physical Trading Pricer
- [ ] Shows "My Profile" section
- [ ] Shows "Contact Us" link
- [ ] Shows "Log Out" button

### Navigation
- [ ] Click "Earth Map" - map loads
- [ ] Click "Commodities Options" - shows "Coming Soon"
- [ ] Click "Commodities Futures" - shows "Coming Soon"
- [ ] Click "Physical Trading Pricer" - shows "Coming Soon"

### Profile Management
- [ ] Click "My Profile"
- [ ] Profile section expands
- [ ] Can edit first name
- [ ] Can edit last name
- [ ] Email field disabled (correct)
- [ ] Can enter new password
- [ ] "Change Password" button works

### Logout
- [ ] Click "Log Out"
- [ ] Redirects to home page
- [ ] Can't access /platform anymore

## ✅ Earth Map Tests

### Map Loads
- [ ] Log in to platform
- [ ] Click "Earth Map"
- [ ] Map displays within 3 seconds
- [ ] Dark blue ocean color
- [ ] Can see continents

### Map Interaction
- [ ] Can click and drag to pan
- [ ] Can zoom in with mouse wheel
- [ ] Can zoom with +/- buttons
- [ ] Map moves smoothly

### Filters Display
- [ ] Commodity category dropdown works
- [ ] Shows 5 categories: Energy, Metals, Agricultural, Industrial, Livestock
- [ ] Specific commodity dropdown works
- [ ] Company dropdown shows 10+ companies
- [ ] Storage checkbox works
- [ ] Search button displays

### Filter Functionality
Test Energy → Crude Oil:
- [ ] Select "Energy" category
- [ ] Select "Crude Oil" commodity
- [ ] Click "Search"
- [ ] 2 markers appear on map
- [ ] Results counter shows "2 locations found"

Test Metals → Copper:
- [ ] Select "Metals" category
- [ ] Select "Copper" commodity
- [ ] Click "Search"
- [ ] 2 markers appear on map
- [ ] Results counter shows "2 locations found"

Test Storage:
- [ ] Clear other filters
- [ ] Check "Storage Facilities"
- [ ] Click "Search"
- [ ] 1 marker appears on map
- [ ] Results counter shows "1 location found"

### Advanced Filters
- [ ] Select "Energy" category
- [ ] Advanced filters section appears
- [ ] "API Range" field displays
- [ ] "Sulfur Range (%)" field displays
- [ ] Select "Metals" category
- [ ] "Concentration Level (%)" field displays

### Marker Interaction
- [ ] Click any marker on map
- [ ] Popup appears
- [ ] Popup shows:
  - [ ] Title/location name
  - [ ] Owner
  - [ ] Address
  - [ ] Contact
  - [ ] Long-term contract status
  - [ ] Volume data
- [ ] Popup styling is consistent (dark blue background)
- [ ] Can close popup

## ✅ Mobile Responsiveness

### Test on Small Screen (< 768px)
- [ ] Resize browser to mobile width, or use device
- [ ] Landing page layout adapts
- [ ] Header stacks properly
- [ ] Hero text readable
- [ ] Cards stack vertically
- [ ] All text readable
- [ ] Buttons accessible
- [ ] Map works on mobile
- [ ] Filters scroll properly
- [ ] Sidebar works on mobile

## ✅ Browser Compatibility

### Chrome
- [ ] All features work in Chrome
- [ ] No console errors

### Firefox
- [ ] All features work in Firefox
- [ ] No console errors

### Safari (Mac/iOS)
- [ ] All features work in Safari
- [ ] No console errors

### Edge
- [ ] All features work in Edge
- [ ] No console errors

## ✅ Performance Checks

### Page Load Times
- [ ] Landing page loads < 2 seconds
- [ ] Platform loads < 3 seconds
- [ ] Map loads < 4 seconds
- [ ] Transitions are smooth
- [ ] No lag when filtering

### Lighthouse Scores (Chrome DevTools)
Run Lighthouse audit (F12 > Lighthouse tab > Analyze page):
- [ ] Performance: 80+ (aim for 90+)
- [ ] Accessibility: 90+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

## ✅ Data Verification

### Sample Data Present
In Supabase Table Editor, verify:
- [ ] `companies` table: 10 rows
  - Trafigura, Glencore, Vitol, Mercuria, Total, Chevron, BP, Shell, Cargill, Olam
- [ ] `commodity_locations` table: 7 rows
  - 2 Crude Oil locations
  - 1 Natural Gas location
  - 2 Copper locations
  - 1 Gold location
  - 1 Storage location

## 🚨 Common Issues & Solutions

### Issue: npm install fails
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: "supabaseUrl is required" error
**Solution:**
1. Check `.env.local` exists
2. Verify variables have actual values (not placeholders)
3. Restart dev server: `Ctrl+C`, then `npm run dev`

### Issue: Login doesn't work
**Solutions:**
1. Verify user exists in Supabase Authentication
2. Check user is "Confirmed" status
3. Try password: Azerty12 (capital A, capital Z)
4. Check browser console for errors

### Issue: Map is blank
**Solutions:**
1. Verify you're logged in
2. Check browser console for errors
3. Verify Supabase credentials are correct
4. Check that `commodity_locations` table has data
5. Try selecting filters and clicking "Search"

### Issue: Demo request fails
**Solutions:**
1. Select a weekday (Monday-Friday)
2. Select a time slot
3. Fill all required fields
4. Check Supabase credentials
5. Verify `demo_requests` table exists

## ✅ Final Checklist

Before going to production:
- [ ] All tests above pass
- [ ] No console errors anywhere
- [ ] All features work as expected
- [ ] Tested on multiple browsers
- [ ] Tested on mobile device
- [ ] Performance is acceptable
- [ ] Data displays correctly
- [ ] Authentication works reliably
- [ ] Forms submit successfully
- [ ] Map is interactive and responsive

## 📊 Success Criteria

Your setup is successful if:
✅ Landing page loads and looks professional  
✅ Can log in with test credentials  
✅ Can submit demo request  
✅ Platform loads after login  
✅ Map displays and filters work  
✅ Sample data (7 locations) appears on map  
✅ No errors in browser console  
✅ Mobile responsive  

## 🎉 Setup Complete!

If all items are checked, congratulations! Your Commodities Earth platform is fully functional and ready for:
- Adding more data
- Customization
- Building additional features
- Deployment to production

## 📞 Need Help?

If you're stuck on any verification step:
1. Check the relevant documentation:
   - `README.md` - Full documentation
   - `QUICKSTART.md` - Quick setup guide
   - `SUPABASE_SETUP.md` - Database setup
2. Review error messages in:
   - Terminal/console
   - Browser console (F12)
   - Supabase logs
3. Contact: ram2315@columbia.edu

---

**Pro Tip:** Keep this checklist handy for when you:
- Set up the project on a new machine
- Help team members get started
- Troubleshoot issues
- Verify after updates
