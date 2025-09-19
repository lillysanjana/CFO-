import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';

interface ForecastData {
  month: string;
  revenue: number;
  expenses: number;
  cashFlow: number;
  headcount: number;
}

const CFOHelper: React.FC = () => {
  const [spending, setSpending] = useState(50000); // Monthly operational spending
  const [pricing, setPricing] = useState(100); // Average price per customer
  const [hiring, setHiring] = useState(10); // Number of employees
  const [usageCount, setUsageCount] = useState(0);

  // Load usage count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('cfo-helper-usage');
    if (savedCount) {
      setUsageCount(parseInt(savedCount, 10));
    }
  }, []);

  // Update usage count whenever sliders change
  useEffect(() => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('cfo-helper-usage', newCount.toString());
  }, [spending, pricing, hiring]);

  // Calculate forecast data
  const generateForecast = (): ForecastData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: ForecastData[] = [];

    let currentCustomers = 100; // Starting customer base
    let currentHeadcount = hiring;

    months.forEach((month, index) => {
      // Simulate growth
      const growthRate = 0.15; // 15% monthly growth
      const customerGrowth = Math.floor(currentCustomers * growthRate);
      currentCustomers += customerGrowth;

      // Calculate revenue (customers * pricing)
      const revenue = currentCustomers * pricing;

      // Calculate expenses (operational spending + employee costs)
      const employeeCost = currentHeadcount * 5000; // $5k per employee
      const totalExpenses = spending + employeeCost;

      // Hiring plan (hire 1-2 people every 2-3 months)
      if (index % 3 === 0 && index > 0) {
        currentHeadcount += Math.floor(hiring * 0.2);
      }

      const cashFlow = revenue - totalExpenses;

      data.push({
        month,
        revenue,
        expenses: totalExpenses,
        cashFlow,
        headcount: currentHeadcount
      });
    });

    return data;
  };

  const forecastData = generateForecast();
  const totalRevenue = forecastData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = forecastData.reduce((sum, item) => sum + item.expenses, 0);
  const netCashFlow = totalRevenue - totalExpenses;
  const burnRate = totalExpenses / 12; // Monthly burn rate

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const exportReport = async () => {
    const chartsPanel = document.querySelector('.charts-panel') as HTMLElement;
    if (chartsPanel) {
      try {
        const canvas = await html2canvas(chartsPanel, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `cfo-forecast-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>CFO Helper</h1>
        <p>Financial Forecasting for Startup Success</p>
      </div>

      <div className="usage-counter">
        <div>Scenarios Tested: <strong>{usageCount}</strong></div>
      </div>

      <div className="dashboard-grid">
        <div className="controls-panel">
          <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
            Adjust Your Assumptions
          </h3>

          <div className="slider-container">
            <label className="slider-label">
              Monthly Operational Spending
            </label>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={spending}
              onChange={(e) => setSpending(Number(e.target.value))}
              className="slider"
            />
            <div className="metric-value">{formatCurrency(spending)}</div>
          </div>

          <div className="slider-container">
            <label className="slider-label">
              Average Price per Customer
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={pricing}
              onChange={(e) => setPricing(Number(e.target.value))}
              className="slider"
            />
            <div className="metric-value">{formatCurrency(pricing)}</div>
          </div>

          <div className="slider-container">
            <label className="slider-label">
              Initial Team Size
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={hiring}
              onChange={(e) => setHiring(Number(e.target.value))}
              className="slider"
            />
            <div className="metric-value">{hiring} employees</div>
          </div>

          <div className="forecast-summary">
            <div className="forecast-item">
              <div className="forecast-label">Annual Revenue</div>
              <div className={`forecast-value ${totalRevenue > 0 ? 'positive' : 'neutral'}`}>
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <div className="forecast-item">
              <div className="forecast-label">Annual Expenses</div>
              <div className="forecast-value negative">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
            <div className="forecast-item">
              <div className="forecast-label">Net Cash Flow</div>
              <div className={`forecast-value ${netCashFlow > 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(netCashFlow)}
              </div>
            </div>
            <div className="forecast-item">
              <div className="forecast-label">Monthly Burn</div>
              <div className="forecast-value neutral">
                {formatCurrency(burnRate)}
              </div>
            </div>
          </div>

          <div className="export-section">
            <button onClick={exportReport} className="button">
              Export Charts as Image
            </button>
          </div>
        </div>

        <div className="charts-panel">
          <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
            12-Month Financial Forecast
          </h3>

          <div className="chart-container">
            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
              Revenue vs Expenses Distribution
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Total Revenue', value: totalRevenue, fill: 'var(--accent-green)' },
                    { name: 'Total Expenses', value: totalExpenses, fill: 'var(--accent-red)' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ value }) => formatCurrency(value)}
                >
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
              Cash Flow Projection
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Cash Flow']}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cashFlow" 
                  stroke="var(--primary-blue)" 
                  fill="var(--primary-blue)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
              Team Growth Plan
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  formatter={(value: number) => [`${value} employees`, 'Headcount']}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="headcount" fill="var(--accent-orange)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFOHelper;