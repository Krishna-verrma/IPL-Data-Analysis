# SportsPulse – IPL Data Analysis with Pandas

Comprehensive Exploratory Data Analysis (EDA) on Indian Premier League (IPL) cricket datasets using Python, pandas, and NumPy.

## 🏏 Overview

This project explores historical IPL match and ball-by-ball delivery statistics. It leverages core pandas data manipulation techniques such as:
- Aggregations and grouping (`groupby()`, `agg()`)
- Multi-dimensional indexing and reshaping (`pivot_table()`, `melt()`)
- Frequency analysis (`crosstab()`)
- Data cleaning and standardization

---

## 📂 Project Structure

```text
├── deliveries.csv                            # Ball-by-ball delivery dataset
├── matches.csv                               # Match metadata and season statistics
├── SportsPulse_IPL_Pandas_Project_FIXED.ipynb # Complete EDA Jupyter Notebook
├── .gitignore                                # Git ignore configuration
└── README.md                                 # Project documentation
```

---

## 📊 Datasets

1. **`deliveries.csv`**: Ball-by-ball information including match ID, inning, batting and bowling teams, batter, bowler, runs, dismissals, and extras.
2. **`matches.csv`**: Match-level summary data covering season, date, venue, toss decision, match outcome, and Player of the Match awards.

---

## 🚀 How to Run

1. **Clone or Download the Repository:**
   ```bash
   git clone <repo-url>
   cd "EDA PROJECT"
   ```

2. **Set up Python Environment:**
   Ensure you have Python 3.8+ installed along with Jupyter and required libraries:
   ```bash
   pip install pandas numpy jupyter
   ```

3. **Launch the Notebook:**
   ```bash
   jupyter notebook SportsPulse_IPL_Pandas_Project_FIXED.ipynb
   ```
   Run all cells sequentially (**Cell → Run All** or **Run → Run All Cells**).
