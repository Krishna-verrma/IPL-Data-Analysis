# SportsPulse – IPL Data Analytics & Interactive Dashboard 🏏📊

An end-to-end Exploratory Data Analysis (EDA) and interactive web visualization platform for the **Indian Premier League (IPL)** covering 17 seasons (2008 – 2024), 1,095+ matches, and 260,000+ ball-by-ball deliveries.

Built with **Python, Pandas, NumPy, Matplotlib**, and a modern **Vanilla HTML5/CSS/JavaScript + Chart.js** analytics web portal.

---

## 🌟 Highlights

- **Interactive Analytics Web App (`index.html`)**:
  - **KPI Header**: Live counters for total matches, runs, balls bowled, wickets, all-time run king (Virat Kohli), and most successful franchise (Mumbai Indians).
  - **Batting Masterclass**: Dynamic horizontal bar charts toggling between Total Runs, Strike Rate, and Batting Average; boundary analysis (4s vs 6s); individual high scores; and a searchable data matrix.
  - **Bowling Dynamics**: Economy rate benchmarks (min 500 deliveries), top wicket-takers ranking, and death bowling breakdown.
  - **Franchise Dominance**: All-time match wins, knockout/playoff match resilience, and multi-season franchise scoring trends.
  - **Over-by-Over Progression**: Run-rate curves comparing Innings 1 (setting target) vs Innings 2 (chasing target) categorized by Powerplay (1–6), Middle (7–15), and Death overs (16–20).
  - **Broadcaster Studio**: Dynamic commentary brief generator with one-click copy and Player of the Match Hall of Fame.
- **Visualized Jupyter Notebook (`SportsPulse_IPL_Pandas_Project_FIXED.ipynb`)**:
  - All core Pandas groupby, multi-aggregations (`agg()`), pivot tables, melting (`melt()`), and crosstabs (`crosstab()`).
  - Integrated Matplotlib bar charts, horizontal comparisons, line trends, and match result distributions.

---

## 📂 Repository Structure

```text
├── index.html                                # Interactive Analytics Web Application
├── style.css                                 # Premium dark stadium design system
├── app.js                                    # Chart.js visualization and interactive logic
├── data.js                                   # Pre-computed analytics dataset (zero CORS issue)
├── ipl_analytics_data.json                   # Structured JSON analytics payload
├── extract_data.py                           # Data extraction & aggregation pipeline script
├── SportsPulse_IPL_Pandas_Project_FIXED.ipynb# Jupyter Notebook with full EDA & Matplotlib plots
├── deliveries.csv                            # Ball-by-ball delivery dataset
├── matches.csv                               # Match metadata and season statistics
├── .gitignore                                # Git ignore configuration
└── README.md                                 # Project documentation
```

---

## 🚀 Getting Started

### 1. View the Interactive Analytics Website
You can launch the web application immediately in your browser:
- **Option A (Instant)**: Simply double-click [`index.html`](index.html) or open it with your favorite browser (Chrome, Edge, Firefox, Safari).
- **Option B (Local HTTP Server)**:
  ```bash
  python -m http.server 8080
  ```
  Then open `http://localhost:8080` in your browser.
- **Option C (GitHub Pages)**:
  Once pushed to GitHub, go to **Repository Settings → Pages**, set branch to `main`, and your analytics portal is live online!

---

### 2. Run the Jupyter Notebook

1. **Install Python dependencies:**
   ```bash
   pip install pandas numpy matplotlib jupyter
   ```
2. **Launch Jupyter:**
   ```bash
   jupyter notebook SportsPulse_IPL_Pandas_Project_FIXED.ipynb
   ```
3. Run all cells from top to bottom (**Cell → Run All**).

---

## 🏏 Key Insights from the Data

- **All-Time Run King**: Virat Kohli leads with **8,014 runs** and a batting average of ~38.71.
- **Franchise Supremacy**: Mumbai Indians lead with **144 total wins** (5 titles), followed by Chennai Super Kings with **138 total wins** (5 titles).
- **Knockout Resilience**: Mumbai Indians (19) and Chennai Super Kings (17) dominate playoff and knockout match victories.
- **Bowling Economy**: Rashid Khan and Anil Kumble hold the lowest economy rates in IPL history among bowlers with 500+ balls bowled.
- **Death Overs Surge**: Run rate escalates from **1.2 runs/ball** in powerplay/middle overs to **1.8+ runs/ball** in death overs (overs 16–20).

---

## 📜 License
Open-source under the MIT License.
