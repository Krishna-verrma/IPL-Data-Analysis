import json
import pandas as pd
import numpy as np

print("Loading CSV files...")
balls = pd.read_csv("deliveries.csv")
matches = pd.read_csv("matches.csv")

# Clean column headers
balls.columns = balls.columns.str.strip()
matches.columns = matches.columns.str.strip()

if "batsman" not in balls.columns and "batter" in balls.columns:
    balls = balls.rename(columns={"batter": "batsman"})

# Merge season into balls
season_lookup = matches[["id", "season"]].drop_duplicates("id")
data = balls.merge(season_lookup, left_on="match_id", right_on="id", how="left")

for col in ["batsman_runs", "extra_runs", "total_runs"]:
    if col in data.columns:
        data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0)

print("Calculating KPI stats...")
total_matches = int(matches["id"].nunique())
seasons_list = sorted([str(s) for s in matches["season"].dropna().unique()])
total_runs = int(data["total_runs"].sum())
total_balls = int(len(data))
total_wickets = int(data["player_dismissed"].notna().sum())

# 1. Top Run Scorers
batsman_match_runs = (
    data.groupby(["batsman", "match_id"])["batsman_runs"]
    .sum()
    .reset_index(name="match_runs")
)

batter_summary = (
    batsman_match_runs.groupby("batsman")["match_runs"]
    .agg(
        total_runs="sum",
        average_runs_per_match="mean",
        highest_match_score="max",
        matches_played="count"
    )
)

balls_faced_by_batter = data.groupby("batsman")["ball"].count()
fours_by_batter = data[data["batsman_runs"] == 4].groupby("batsman").size()
sixes_by_batter = data[data["batsman_runs"] == 6].groupby("batsman").size()
dismissals_by_batter = data[data["player_dismissed"].notna()].groupby("player_dismissed").size()

batter_summary["balls_faced"] = batter_summary.index.map(balls_faced_by_batter).fillna(0).astype(int)
batter_summary["fours"] = batter_summary.index.map(fours_by_batter).fillna(0).astype(int)
batter_summary["sixes"] = batter_summary.index.map(sixes_by_batter).fillna(0).astype(int)
batter_summary["dismissals"] = batter_summary.index.map(dismissals_by_batter).fillna(0).astype(int)
batter_summary["strike_rate"] = (batter_summary["total_runs"] / batter_summary["balls_faced"] * 100).round(2)
batter_summary["batting_average"] = (batter_summary["total_runs"] / batter_summary["dismissals"].replace(0, np.nan)).round(2)

top_batters_df = batter_summary.sort_values("total_runs", ascending=False).head(15).reset_index()
top_batters = []
for _, row in top_batters_df.iterrows():
    top_batters.append({
        "batsman": str(row["batsman"]),
        "total_runs": int(row["total_runs"]),
        "matches_played": int(row["matches_played"]),
        "average_runs_per_match": round(float(row["average_runs_per_match"]), 2),
        "batting_average": round(float(row["batting_average"]), 2) if not np.isnan(row["batting_average"]) else 0.0,
        "highest_match_score": int(row["highest_match_score"]),
        "strike_rate": round(float(row["strike_rate"]), 2),
        "fours": int(row["fours"]),
        "sixes": int(row["sixes"])
    })

# 2. Bowler Summary
wickets_by_bowler = data[data["player_dismissed"].notna()].groupby("bowler").size()
bowler_summary = (
    data.groupby("bowler")
    .agg(
        balls_bowled=("bowler", "count"),
        runs_conceded=("total_runs", "sum")
    )
)
bowler_summary["economy_rate"] = (
    bowler_summary["runs_conceded"] / (bowler_summary["balls_bowled"] / 6)
).round(2)
bowler_summary["wickets"] = bowler_summary.index.map(wickets_by_bowler).fillna(0).astype(int)

top_bowlers_df = (
    bowler_summary[bowler_summary["balls_bowled"] >= 500]
    .sort_values("economy_rate")
    .head(15)
    .reset_index()
)
top_bowlers = []
for _, row in top_bowlers_df.iterrows():
    top_bowlers.append({
        "bowler": str(row["bowler"]),
        "balls_bowled": int(row["balls_bowled"]),
        "overs": round(row["balls_bowled"] / 6, 1),
        "runs_conceded": int(row["runs_conceded"]),
        "economy_rate": round(float(row["economy_rate"]), 2),
        "wickets": int(row["wickets"])
    })

# Top wicket takers (regardless of minimum balls, sorted by wickets)
top_wicket_takers_df = bowler_summary.sort_values("wickets", ascending=False).head(15).reset_index()
top_wicket_takers = []
for _, row in top_wicket_takers_df.iterrows():
    top_wicket_takers.append({
        "bowler": str(row["bowler"]),
        "wickets": int(row["wickets"]),
        "balls_bowled": int(row["balls_bowled"]),
        "economy_rate": round(float(row["economy_rate"]), 2),
        "runs_conceded": int(row["runs_conceded"])
    })

# 3. Team Wins & Matches
team_wins_series = matches["winner"].dropna().value_counts()
team1_counts = matches["team1"].value_counts()
team2_counts = matches["team2"].value_counts()
total_team_matches = (team1_counts.add(team2_counts, fill_value=0)).astype(int)

# Knockout wins
knockout_matches = matches[
    matches["match_type"].astype(str).str.contains(
        "final|qualifier|eliminator|play-off|playoff|semi",
        case=False,
        na=False
    )
]
knockout_wins = knockout_matches["winner"].dropna().value_counts()

# Finals won (champions)
finals = matches[matches["match_type"].astype(str).str.lower().str.strip() == "final"]
final_wins = finals["winner"].dropna().value_counts()

team_stats = []
for team, wins in team_wins_series.head(12).items():
    t_matches = int(total_team_matches.get(team, wins))
    k_wins = int(knockout_wins.get(team, 0))
    titles = int(final_wins.get(team, 0))
    win_pct = round((wins / t_matches * 100), 1) if t_matches > 0 else 0.0
    team_stats.append({
        "team": str(team),
        "wins": int(wins),
        "matches": t_matches,
        "win_percentage": win_pct,
        "knockout_wins": k_wins,
        "titles": titles
    })

# 4. Season Statistics
runs_per_season = data.groupby("season")["total_runs"].sum()
matches_per_season = matches.groupby("season")["id"].nunique()
season_summary = pd.concat([runs_per_season, matches_per_season], axis=1).fillna(0)
season_summary.columns = ["total_runs", "matches_played"]
season_summary["average_runs_per_match"] = (season_summary["total_runs"] / season_summary["matches_played"]).round(1)

seasons_data = []
for season in sorted(season_summary.index.astype(str)):
    orig_idx = int(season) if season.isdigit() else season
    if orig_idx in season_summary.index:
        r = season_summary.loc[orig_idx]
    else:
        r = season_summary.loc[season]
    seasons_data.append({
        "season": str(season),
        "matches_played": int(r["matches_played"]),
        "total_runs": int(r["total_runs"]),
        "average_runs_per_match": round(float(r["average_runs_per_match"]), 1)
    })

# 5. Over-by-Over scoring (Innings 1 vs Innings 2)
# Over index 1 to 20
over_innings_avg = pd.pivot_table(
    data[data["inning"].isin([1, 2])],
    index="over",
    columns="inning",
    values="total_runs",
    aggfunc="mean"
).fillna(0)

# Also total runs per over (sum / distinct matches)
matches_count = matches["id"].nunique()
over_innings_total_runs = pd.pivot_table(
    data[data["inning"].isin([1, 2])],
    index="over",
    columns="inning",
    values="total_runs",
    aggfunc="sum"
).fillna(0)

over_progression = []
for over_num in sorted(over_innings_avg.index):
    inn1_val = round(float(over_innings_avg.loc[over_num, 1]), 2) if 1 in over_innings_avg.columns else 0.0
    inn2_val = round(float(over_innings_avg.loc[over_num, 2]), 2) if 2 in over_innings_avg.columns else 0.0
    over_progression.append({
        "over": int(over_num),
        "innings1_avg": inn1_val,
        "innings2_avg": inn2_val
    })

# 6. Toss Decisions & Impact
toss_decision_counts = matches["toss_decision"].value_counts().to_dict()
# Did toss winner win match?
toss_win_match_win = int((matches["toss_winner"] == matches["winner"]).sum())
toss_win_match_loss = int(matches["winner"].notna().sum() - toss_win_match_win)

toss_stats = {
    "decisions": {str(k): int(v) for k, v in toss_decision_counts.items()},
    "toss_winner_won_match": toss_win_match_win,
    "toss_winner_lost_match": toss_win_match_loss,
    "win_rate_percentage": round((toss_win_match_win / (toss_win_match_win + toss_win_match_loss) * 100), 1)
}

# 7. Player of the Match awards Top 10
potm = matches["player_of_match"].value_counts().head(10).to_dict()
potm_list = [{"player": str(k), "awards": int(v)} for k, v in potm.items()]

# 8. Team vs Season Runs (Pivot table for top teams)
top_teams = [t["team"] for t in team_stats[:6]]
team_season_pivot = pd.pivot_table(
    data[data["batting_team"].isin(top_teams)],
    index="batting_team",
    columns="season",
    values="batsman_runs",
    aggfunc="sum",
    fill_value=0
)

team_season_runs_data = {
    "seasons": [str(c) for c in team_season_pivot.columns],
    "teams": {}
}
for team in top_teams:
    if team in team_season_pivot.index:
        team_season_runs_data["teams"][team] = [int(v) for v in team_season_pivot.loc[team].values]

output = {
    "kpi": {
        "total_matches": total_matches,
        "total_runs": total_runs,
        "total_balls": total_balls,
        "total_wickets": total_wickets,
        "total_seasons": len(seasons_list),
        "seasons_range": f"{seasons_list[0]} - {seasons_list[-1]}",
        "top_run_scorer": top_batters[0]["batsman"],
        "top_run_scorer_runs": top_batters[0]["total_runs"],
        "top_bowler_economy": top_bowlers[0]["bowler"],
        "top_bowler_economy_rate": top_bowlers[0]["economy_rate"],
        "top_team": team_stats[0]["team"],
        "top_team_wins": team_stats[0]["wins"]
    },
    "top_batters": top_batters,
    "top_bowlers_economy": top_bowlers,
    "top_wicket_takers": top_wicket_takers,
    "team_stats": team_stats,
    "season_summary": seasons_data,
    "over_progression": over_progression,
    "toss_stats": toss_stats,
    "potm": potm_list,
    "team_season_runs": team_season_runs_data
}

with open("ipl_analytics_data.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)

print("Saved ipl_analytics_data.json successfully!")
print(f"Top Run Scorer: {output['kpi']['top_run_scorer']} ({output['kpi']['top_run_scorer_runs']} runs)")
print(f"Top Team: {output['kpi']['top_team']} ({output['kpi']['top_team_wins']} wins)")
