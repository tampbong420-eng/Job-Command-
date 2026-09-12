# Job Command

Field-ops dashboard for Job Command. Both **Boss** and **Employee** roles share
the same shop: crew, jobs, estimates, time cards, and settings persist in the
browser.

Boss Command is the dispatch desk:

- **Main Command** tab with the **Employees** rolodex, live hours, clock status, and weekly schedule
- **All Jobs** tab for the customer board
- **Employee Profiles** tab with every shop card, hours, and clock status
- **Edit Hours** calendar for each employee
- Combination-lock job tumbler that cycles **active jobs only**
- **Get Directions** opens Street View and Google Maps
- Live Google Map on the employees desk
- Semantic job colors: new leads red, pending orange/yellow, active light green, finished charcoal
- Customer cards with **New lead / Pending / Active / Finished / Delete**
- **Add customer** form plus Cards / Estimates / Time cards tabs
- **AI Talk** on every page for status, estimates, time cards, and new leads

Employee Command is the field side of the same shop:

- Orange **Clocked Out** / green **Clocked In** tile wired to the shared crew roster
- Assigned job with **Get Directions**
- On-clock crew Call list
- **My Stops** board (jobs locked to that employee)
- **Employee Profiles** tab to pick which phone is clocking in
- Settings for shop name, account chip, page alerts, and **Reset demo shop**

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Switch **EMPLOYEE** /
**BOSS** in the top bar.
