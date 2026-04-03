# Harvest Moon DS – Complete Profit Planner

A **day‑by‑day farming simulation tool** for *Harvest Moon DS* that helps you plan your crops, fruit trees and mushrooms to maximise profits.  
Inspired by the classic “Profit Planner” for *Harvest Moon: Friends of Mineral Town* (GBA), this web app brings the same planning power to the DS version.

## ✨ Features

- **Crops (Spring / Summer / Autumn)** – 30‑day tables, soil type modifiers, replant toggle, regrowth support.
- **Waterfall Field** – Super growth (-2 days), crops can be grown all year (120‑day timeline).
- **Basements** – Normal growth, all‑year farming (120‑day timeline).
- **Fruit Trees** – Plant once, harvest every few days during their production season (Summer or Fall). Option to mark trees as “already mature” to skip the first year’s growth.
- **Mushrooms** – Grow in the Mushroom House (no soil effect). Choose harvest size (Small / Medium / Large) which affects initial growth, profit and regrowth cycle. “Already planted” checkbox bypasses the long initial growth.
- **Level system** – Crops, trees and mushrooms can be levelled up (1‑100). Profit = base price × level² × quantity.
- **Day‑by‑day timeline** – Each table shows every single day. Icons indicate **🌱 sowing**, **🍅 harvest** and **🔄 regrowth**. If harvest and sowing happen on the same day (replant option), the cell is split with both icons and colours.
- **Seasonal colour coding** – 30‑day tables have a uniform seasonal background. 120‑day tables are divided into four 30‑day blocks (Spring = green, Summer = yellow, Autumn = orange, Winter = light blue).
- **Profit summaries** – Per table and a global total that adds all sections.
- **Local storage** – All your entries are saved automatically in your browser.
- **Clear buttons** – Clear individual tables or erase all data with one click.

## 🕹️ How to Use

1. **Add an entry** – Select the crop / tree / mushroom, enter quantity, level, sowing day, and any specific options (soil type, replant, harvest size, mature flag).
2. **View the table** – Each row shows a timeline of the whole season/year. Hover over the day numbers to see them clearly (the tables are horizontally scrollable).
3. **Edit / Delete** – Use the ✏️ and 🗑️ buttons next to each entry.
4. **Check profits** – The total profit for the section appears below the table, and the global summary at the bottom updates automatically.
5. **Clear data** – Use the yellow “Clear table” buttons or the red “Clear All Data” button in the global summary.

> **Note**: For crops that naturally regrow (e.g., Cucumber, Tomato, Pineapple), the “Replant after harvest” checkbox is disabled – regrowth is always more efficient.

## 🧠 Game Mechanics Implemented

The tool respects all game data from the excellent **Ushi No Tane** *Harvest Moon DS* guide:

- [Main Guide](https://fogu.com/hm6/index.php)
- [Seasonal Crops](https://fogu.com/hm6/chan8/index.php)
- [Mushroom House](https://fogu.com/hm6/chan8/fungushouse.php)
- [Fruit Trees](https://fogu.com/hm6/chan8/trees.php)
- [Field Types (Slow / Normal / Fast / Super)](https://fogu.com/hm6/chan8/fieldtypes.php)
- [Crop Leveling](https://fogu.com/hm6/chan8/croplevels.php)
- [Basement System](https://fogu.com/hm6/chan8/basements.php)

The concept of a profit planner was inspired by the [Profit Planner for Harvest Moon: Friends of Mineral Town (GBA)](https://fogu.com/hm4/preview/profit_planner.zip) provided by the same community.

## 🚀 Live Demo

You can try the planner online at:  
**[https://nehemiasfeliz.com/Harvest_Moon_DS_-_Profit_Planner/](https://nehemiasfeliz.com/Harvest_Moon_DS_-_Profit_Planner/)**

## 🛠️ Built With

- HTML5, CSS3, JavaScript (ES6)
- [Font Awesome](https://fontawesome.com/) for icons
- LocalStorage for data persistence
- No external dependencies – runs entirely in your browser

## 📂 Repository Structure
```
.
├── index.html # Main page structure
├── style.css # All styling (responsive, seasonal colours)
└── script.js # Full logic: simulations, UI, storage
```

## 📄 License

This project is released under the **MIT License** – you are free to use, modify and distribute it, as long as you retain the original copyright notice.  
See the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Cherubae** and the whole **Ushi No Tane** community for the incredible *Harvest Moon* guides over the years.
- The original **Profit Planner** for *HM: FoMT* (GBA) – the direct inspiration for this tool.
- All *Harvest Moon* fans who still enjoy planning their virtual farms.

## 📧 Contact

If you find any bugs or have suggestions, please open an [Issue](https://github.com/juniornff/Harvest_Moon_DS_-_Profit_Planner/issues) on GitHub.

---

*Happy farming!* 🌾