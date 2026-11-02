/**
 * SportsPulse IPL Analytics Hub - Main Application Logic
 * Powered by Chart.js & Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if data is present
  const data = window.IPL_DATA;
  if (!data) {
    console.error('IPL Data not loaded. Please ensure data.js is included.');
    return;
  }

  initKPIs(data.kpi);
  initTabNavigation();
  initCharts(data);
  initTables(data);
  initCommentary(data);
});

/**
 * Configure global Chart.js aesthetic defaults
 */
function configureChartDefaults() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#fff';
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 13 };
  Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.12)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

/**
 * Render High-Impact KPI Cards
 */
function initKPIs(kpi) {
  const container = document.getElementById('kpiContainer');
  if (!container) return;

  const cards = [
    {
      title: 'Total Matches',
      value: kpi.total_matches.toLocaleString(),
      subtext: `${kpi.seasons_range} (${kpi.total_seasons} seasons)`,
      color: '#3b82f6',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
    },
    {
      title: 'Total Runs Scored',
      value: kpi.total_runs.toLocaleString(),
      subtext: `Across all ${kpi.total_matches} games`,
      color: '#f59e0b',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>`
    },
    {
      title: 'Deliveries Bowled',
      value: kpi.total_balls.toLocaleString(),
      subtext: 'Ball-by-ball tracked records',
      color: '#06b6d4',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M4.93 4.93l4.24 4.24"></path><path d="M14.83 14.83l4.24 4.24"></path></svg>`
    },
    {
      title: 'Wickets Taken',
      value: kpi.total_wickets.toLocaleString(),
      subtext: 'All dismissals recorded',
      color: '#ef4444',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    },
    {
      title: 'All-Time Run King',
      value: kpi.top_run_scorer,
      subtext: `${kpi.top_run_scorer_runs.toLocaleString()} runs in IPL`,
      color: '#10b981',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
    },
    {
      title: 'Most Successful Franchise',
      value: kpi.top_team,
      subtext: `${kpi.top_team_wins} wins & 5 IPL Trophies`,
      color: '#8b5cf6',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`
    }
  ];

  container.innerHTML = cards.map(c => `
    <div class="kpi-card" style="--card-color: ${c.color}">
      <div class="kpi-header">
        <span class="kpi-title">${c.title}</span>
        <div class="kpi-icon">${c.icon}</div>
      </div>
      <div class="kpi-value">${c.value}</div>
      <div class="kpi-subtext">${c.subtext}</div>
    </div>
  `).join('');
}

let topBattersChartInstance = null;
const allChartInstances = [];

/**
 * Tab Navigation logic & Canvas auto-resizing
 */
function initTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
        setTimeout(() => {
          allChartInstances.forEach(chart => {
            try {
              chart.resize();
            } catch (err) {}
          });
        }, 60);
      }
    });
  });

  const notebookBtn = document.getElementById('btnViewNotebook');
  if (notebookBtn) {
    notebookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const commentaryTab = document.getElementById('tabBtnCommentary');
      if (commentaryTab) commentaryTab.click();
    });
  }
}


function createChart(ctx, config) {
  const chart = new Chart(ctx, config);
  allChartInstances.push(chart);
  return chart;
}

function initCharts(data) {
  configureChartDefaults();

  // 1. Season Evolution: Matches vs Average Runs/Match
  const seasonCtx = document.getElementById('seasonEvolutionChart');
  if (seasonCtx) {
    const seasons = data.season_summary.map(s => s.season);
    const matchesCount = data.season_summary.map(s => s.matches_played);
    const avgRuns = data.season_summary.map(s => s.average_runs_per_match);

    createChart(seasonCtx, {
      type: 'bar',
      data: {
        labels: seasons,
        datasets: [
          {
            type: 'bar',
            label: 'Matches Played',
            data: matchesCount,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Avg Runs / Match',
            data: avgRuns,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderWidth: 3,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            position: 'left',
            title: { display: true, text: 'Matches Played', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y1: {
            position: 'right',
            title: { display: true, text: 'Average Runs / Match', color: '#f59e0b' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  // 2. Toss Decision Impact: Doughnut Chart
  const tossCtx = document.getElementById('tossImpactChart');
  if (tossCtx) {
    const toss = data.toss_stats;
    createChart(tossCtx, {
      type: 'doughnut',
      data: {
        labels: ['Field First', 'Bat First', 'Toss Winner Won Match', 'Toss Winner Lost'],
        datasets: [{
          data: [
            toss.decisions.field || 0,
            toss.decisions.bat || 0,
            toss.toss_winner_won_match || 0,
            toss.toss_winner_lost_match || 0
          ],
          backgroundColor: [
            '#06b6d4',
            '#3b82f6',
            '#10b981',
            '#ef4444'
          ],
          borderColor: '#0f172a',
          borderWidth: 3
        }]
      },
      options: {
        cutout: '62%',
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw} instances`
            }
          }
        }
      }
    });
  }

  // 3. Top Batters Horizontal Bar Chart with Dynamic Controls
  const battersCtx = document.getElementById('topBattersChart');
  if (battersCtx) {
    const top10 = data.top_batters.slice(0, 10);
    const labels = top10.map(b => b.batsman);

    topBattersChartInstance = createChart(battersCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Runs',
          data: top10.map(b => b.total_runs),
          backgroundColor: 'rgba(59, 130, 246, 0.85)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            title: { display: true, text: 'Total Runs Scored', color: '#94a3b8' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });

    // Toggle Buttons for Batters Metric
    const btnRuns = document.getElementById('btnBattingRuns');
    const btnSR = document.getElementById('btnBattingSR');
    const btnAvg = document.getElementById('btnBattingAvg');

    const updateBatterMetric = (metric, label, color, axisTitle) => {
      [btnRuns, btnSR, btnAvg].forEach(b => b && b.classList.remove('active'));
      topBattersChartInstance.data.datasets[0].label = label;
      topBattersChartInstance.data.datasets[0].data = top10.map(b => b[metric]);
      topBattersChartInstance.data.datasets[0].backgroundColor = color;
      topBattersChartInstance.data.datasets[0].borderColor = color.replace('0.85', '1');
      topBattersChartInstance.options.scales.x.title.text = axisTitle;
      topBattersChartInstance.update();
    };

    if (btnRuns) btnRuns.addEventListener('click', () => {
      btnRuns.classList.add('active');
      updateBatterMetric('total_runs', 'Total Runs', 'rgba(59, 130, 246, 0.85)', 'Total Runs Scored');
    });

    if (btnSR) btnSR.addEventListener('click', () => {
      btnSR.classList.add('active');
      updateBatterMetric('strike_rate', 'Strike Rate', 'rgba(245, 158, 11, 0.85)', 'Batting Strike Rate');
    });

    if (btnAvg) btnAvg.addEventListener('click', () => {
      btnAvg.classList.add('active');
      updateBatterMetric('batting_average', 'Batting Average', 'rgba(16, 185, 129, 0.85)', 'Batting Average (Runs / Dismissal)');
    });
  }

  // 4. Boundary Breakdown (Fours vs Sixes)
  const boundaryCtx = document.getElementById('boundariesChart');
  if (boundaryCtx) {
    const top10 = data.top_batters.slice(0, 10);
    createChart(boundaryCtx, {
      type: 'bar',
      data: {
        labels: top10.map(b => b.batsman),
        datasets: [
          {
            label: 'Fours (4s)',
            data: top10.map(b => b.fours),
            backgroundColor: 'rgba(6, 182, 212, 0.85)',
            borderRadius: 4
          },
          {
            label: 'Sixes (6s)',
            data: top10.map(b => b.sixes),
            backgroundColor: 'rgba(244, 63, 94, 0.85)',
            borderRadius: 4
          }
        ]
      },
      options: {
        scales: {
          x: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // 5. Highest Individual Match Scores
  const highScoreCtx = document.getElementById('highScoreChart');
  if (highScoreCtx) {
    const top10 = data.top_batters.slice(0, 10);
    createChart(highScoreCtx, {
      type: 'bar',
      data: {
        labels: top10.map(b => b.batsman),
        datasets: [{
          label: 'Highest Match Score',
          data: top10.map(b => b.highest_match_score),
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // 6. Most Economical Bowlers Bar Chart
  const ecoBowlerCtx = document.getElementById('economicalBowlersChart');
  if (ecoBowlerCtx) {
    const top10Eco = data.top_bowlers_economy.slice(0, 10);
    createChart(ecoBowlerCtx, {
      type: 'bar',
      data: {
        labels: top10Eco.map(b => b.bowler),
        datasets: [{
          label: 'Economy Rate (Runs/Over)',
          data: top10Eco.map(b => b.economy_rate),
          backgroundColor: 'rgba(139, 92, 246, 0.85)',
          borderColor: '#8b5cf6',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            min: 5,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            title: { display: true, text: 'Economy Rate (Runs per Over)', color: '#94a3b8' }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // 7. Top Wicket Takers Bar Chart
  const wicketCtx = document.getElementById('wicketTakersChart');
  if (wicketCtx) {
    const top10Wickets = data.top_wicket_takers.slice(0, 10);
    createChart(wicketCtx, {
      type: 'bar',
      data: {
        labels: top10Wickets.map(b => b.bowler),
        datasets: [{
          label: 'Wickets Dismissed',
          data: top10Wickets.map(b => b.wickets),
          backgroundColor: 'rgba(244, 63, 94, 0.85)',
          borderColor: '#f43f5e',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // 8. Team Wins & Knockouts
  const teamWinsCtx = document.getElementById('teamWinsChart');
  if (teamWinsCtx) {
    const teams = data.team_stats.slice(0, 10);
    createChart(teamWinsCtx, {
      type: 'bar',
      data: {
        labels: teams.map(t => t.team),
        datasets: [{
          label: 'Total Wins',
          data: teams.map(t => t.wins),
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderColor: '#f59e0b',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // 9. Knockout Wins Chart
  const knockoutCtx = document.getElementById('knockoutWinsChart');
  if (knockoutCtx) {
    const knockoutTeams = data.team_stats.filter(t => t.knockout_wins > 0).slice(0, 8);
    createChart(knockoutCtx, {
      type: 'bar',
      data: {
        labels: knockoutTeams.map(t => t.team),
        datasets: [{
          label: 'Knockout Wins',
          data: knockoutTeams.map(t => t.knockout_wins),
          backgroundColor: 'rgba(236, 72, 153, 0.85)',
          borderColor: '#ec4899',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // 10. Multi-line Team Season Runs Chart
  const teamSeasonRunsCtx = document.getElementById('teamSeasonRunsChart');
  if (teamSeasonRunsCtx && data.team_season_runs) {
    const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];
    const datasets = Object.keys(data.team_season_runs.teams).map((teamName, i) => ({
      label: teamName,
      data: data.team_season_runs.teams[teamName],
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 3
    }));

    createChart(teamSeasonRunsCtx, {
      type: 'line',
      data: {
        labels: data.team_season_runs.seasons,
        datasets: datasets
      },
      options: {
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: {
            title: { display: true, text: 'Total Batsman Runs in Season', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }

  // 11. Over-by-Over Progression: Innings 1 vs Innings 2 Curve
  const overCtx = document.getElementById('overProgressionChart');
  if (overCtx) {
    const overs = data.over_progression.map(o => `Over ${o.over}`);
    const inn1 = data.over_progression.map(o => o.innings1_avg);
    const inn2 = data.over_progression.map(o => o.innings2_avg);

    createChart(overCtx, {
      type: 'line',
      data: {
        labels: overs,
        datasets: [
          {
            label: 'Innings 1 (Setting Target)',
            data: inn1,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6'
          },
          {
            label: 'Innings 2 (Chasing Target)',
            data: inn2,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444'
          }
        ]
      },
      options: {
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: {
            title: { display: true, text: 'Average Runs per Ball', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }

  // 12. Player of the Match Hall of Fame
  const potmCtx = document.getElementById('potmChart');
  if (potmCtx) {
    const potmList = data.potm;
    createChart(potmCtx, {
      type: 'bar',
      data: {
        labels: potmList.map(p => p.player),
        datasets: [{
          label: 'Player of the Match Awards',
          data: potmList.map(p => p.awards),
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderColor: '#f59e0b',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }
}

/**
 * Render Interactive Searchable Data Tables
 */
function initTables(data) {
  const battersTbody = document.getElementById('battersTableBody');
  const searchInput = document.getElementById('batterSearch');

  const renderBatters = (list) => {
    if (!battersTbody) return;
    battersTbody.innerHTML = list.map((b, idx) => {
      let rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      return `
        <tr>
          <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
          <td><strong>${b.batsman}</strong></td>
          <td><span class="badge-pill badge-blue">${b.total_runs.toLocaleString()}</span></td>
          <td>${b.matches_played}</td>
          <td>${b.batting_average.toFixed(2)}</td>
          <td>${b.strike_rate.toFixed(2)}</td>
          <td><span class="badge-pill badge-gold">${b.highest_match_score}</span></td>
          <td>${b.fours} / ${b.sixes}</td>
        </tr>
      `;
    }).join('');
  };

  renderBatters(data.top_batters);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = data.top_batters.filter(b => b.batsman.toLowerCase().includes(q));
      renderBatters(filtered);
    });
  }

  // Bowlers Table
  const bowlersTbody = document.getElementById('bowlersTableBody');
  if (bowlersTbody) {
    bowlersTbody.innerHTML = data.top_bowlers_economy.map((b, idx) => {
      let rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      return `
        <tr>
          <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
          <td><strong>${b.bowler}</strong></td>
          <td><span class="badge-pill badge-green">${b.economy_rate.toFixed(2)}</span></td>
          <td>${b.balls_bowled.toLocaleString()}</td>
          <td>${b.overs}</td>
          <td>${b.runs_conceded.toLocaleString()}</td>
          <td><span class="badge-pill badge-gold">${b.wickets}</span></td>
        </tr>
      `;
    }).join('');
  }
}

/**
 * Presenter Commentary Studio logic
 */
function initCommentary(data) {
  const copyBtn = document.getElementById('btnCopyCommentary');
  const textEl = document.getElementById('commentaryText');

  if (copyBtn && textEl) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(textEl.innerText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Copied!
        `;
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2200);
      });
    });
  }
}
