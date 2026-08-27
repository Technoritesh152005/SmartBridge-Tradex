import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function StockChart({ candles, symbol }) {
  const validCandles = (candles || []).filter((c) => Number.isFinite(Number(c.close)) && c.time);

  if (!validCandles.length) {
    return <div className="text-center text-muted py-5">No chart data available</div>;
  }

  const labels = validCandles.map((c) =>
    new Date(c.time * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
  const prices = validCandles.map((c) => Number(c.close));

  const data = {
    labels,
    datasets: [
      {
        label: `${symbol} Price`,
        data: prices,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.12)',
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8 },
      },
      y: {
        beginAtZero: false,
        grid: { color: '#eef2f7' },
        ticks: {
          callback: (value) => `$${Number(value).toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}

export default StockChart;
