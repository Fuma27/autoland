import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FiRefreshCw, FiBarChart2, FiCheckCircle, FiAlertCircle, FiInfo, FiZap, FiTrendingUp, FiTarget, FiUsers, FiClock } from "react-icons/fi";
import '../styles/financial-dashboard.css';
import '../styles/components.css';
import '../styles/sidebar.css';

export default function FinancialDashboard() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });


  useEffect(() => {
    fetchData();

    const handleDataUpdate = () => {
      console.log("Data update event received, refreshing...");
      fetchData();
    };

    window.addEventListener('data-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('data-updated', handleDataUpdate);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, expensesRes, vehiclesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sales`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expenses`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vehicles`)
      ]);

      const salesData = await salesRes.json();
      const expensesData = await expensesRes.json();
      const vehiclesData = await vehiclesRes.json();

      setSales(Array.isArray(salesData) ? salesData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setLastUpdated(new Date());

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  // Get previous period data for comparison
  const getPreviousPeriodData = () => {
    const startDate = parseDate(dateRange.start);
    const endDate = parseDate(dateRange.end);
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);

    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

    return { prevStartDate, prevEndDate };
  };

  // Filter data by date range
  const filteredSales = sales.filter(sale => {
    if (!sale.sale_date) return false;
    const saleDate = parseDate(sale.sale_date);
    const startDate = parseDate(dateRange.start);
    const endDate = parseDate(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return saleDate >= startDate && saleDate <= endDate;
  });

  const filteredExpenses = expenses.filter(expense => {
    if (!expense.date) return false;
    const expenseDate = parseDate(expense.date);
    const startDate = parseDate(dateRange.start);
    const endDate = parseDate(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Previous period data for comparison
  const { prevStartDate, prevEndDate } = getPreviousPeriodData();
  const prevFilteredSales = sales.filter(sale => {
    if (!sale.sale_date) return false;
    const saleDate = parseDate(sale.sale_date);
    return saleDate >= prevStartDate && saleDate <= prevEndDate;
  });
  const prevFilteredExpenses = expenses.filter(expense => {
    if (!expense.date) return false;
    const expenseDate = parseDate(expense.date);
    return expenseDate >= prevStartDate && expenseDate <= prevEndDate;
  });

  // Monthly data for charts
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    const monthlyProfit = new Array(12).fill(0);

    filteredSales.forEach(sale => {
      const month = parseDate(sale.sale_date).getMonth();
      if (month >= 0 && month < 12) {
        monthlyRevenue[month] += Number(sale.amount) || 0;
      }
    });

    filteredExpenses.forEach(expense => {
      const month = parseDate(expense.date).getMonth();
      if (month >= 0 && month < 12) {
        monthlyExpenses[month] += Number(expense.amount) || 0;
      }
    });

    for (let i = 0; i < 12; i++) {
      monthlyProfit[i] = monthlyRevenue[i] - monthlyExpenses[i];
    }

    return { months, monthlyRevenue, monthlyExpenses, monthlyProfit };
  };

  const { months, monthlyRevenue, monthlyExpenses, monthlyProfit } = getMonthlyData();

  // Current period totals
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : 0;

  // Previous period totals for comparison
  const prevTotalRevenue = prevFilteredSales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  const prevTotalExpenses = prevFilteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const prevNetProfit = prevTotalRevenue - prevTotalExpenses;

  // Calculate growth percentages
  const revenueGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100).toFixed(1) : 0;
  const profitGrowth = prevNetProfit > 0 ? ((netProfit - prevNetProfit) / prevNetProfit * 100).toFixed(1) : 0;

  // Vehicle sales by make
  const salesByMake = {};
  filteredSales.forEach(sale => {
    const make = sale.make || sale.vehicle_name?.split(' ')[0] || 'Other';
    salesByMake[make] = (salesByMake[make] || 0) + (Number(sale.amount) || 0);
  });
  const topMakes = Object.entries(salesByMake).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Calculate inventory turnover
  const totalInventoryValue = vehicles.reduce((sum, v) => sum + (Number(v.purchase_price) * (v.quantity || 1)), 0);
  const inventoryTurnover = totalInventoryValue > 0 ? (totalRevenue / totalInventoryValue).toFixed(2) : 0;

  // Payment method breakdown
  const paymentBreakdown = {
    Cash: filteredSales.filter(sale => sale.payment_method === 'Cash').reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0),
    Bank: filteredSales.filter(sale => sale.payment_method === 'Bank').reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0),
    Installment: filteredSales.filter(sale => sale.payment_method === 'Installment').reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0)
  };
  const paymentTotal = paymentBreakdown.Cash + paymentBreakdown.Bank + paymentBreakdown.Installment;
  const installmentPercentage = paymentTotal > 0 ? (paymentBreakdown.Installment / paymentTotal * 100).toFixed(1) : 0;

  // Sales by salesperson
  const salesBySalesperson = {};
  filteredSales.forEach(sale => {
    const salesperson = sale.salesperson || 'Unassigned';
    salesBySalesperson[salesperson] = (salesBySalesperson[salesperson] || 0) + (Number(sale.amount) || 0);
  });
  const topSalespersons = Object.entries(salesBySalesperson).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Calculate average sale value
  const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;



  // Max values for charts
  const maxRevenue = Math.max(...monthlyRevenue, ...monthlyExpenses, 1000);
  const maxChartHeight = 150;

  // ============================================
  // BUSINESS DECISION INSIGHTS - ACTIONABLE RECOMMENDATIONS
  // ============================================

  const generateActionableInsights = () => {
    const insights = [];

    if (filteredSales.length === 0 && filteredExpenses.length === 0) {
      return [{
        type: 'neutral',
        title: 'No Data Available',
        text: 'Add transaction records to receive actionable business insights.',
        action: 'Start by recording your first sale or expense.',
        priority: 'high',
        icon: 'info'
      }];
    }

    // ============================================
    // 1. PROFITABILITY ANALYSIS & RECOMMENDATIONS
    // ============================================
    const margin = Number(profitMargin);

    if (margin >= 25) {
      insights.push({
        type: 'success',
        title: 'Exceptional Profitability',
        text: `Your ${margin}% profit margin exceeds industry average (8-12%). You have pricing power and operational efficiency.`,
        action: 'Consider expanding inventory or opening a second location to leverage your successful model.',
        metric: `+${(margin - 12).toFixed(1)}% above industry avg`,
        priority: 'medium',
        icon: 'trending-up'
      });
    } else if (margin >= 12) {
      insights.push({
        type: 'success',
        title: 'Healthy Profit Margins',
        text: `Your ${margin}% profit margin meets industry benchmarks. Operations are stable and sustainable.`,
        action: 'Focus on customer retention and repeat business to increase volume without sacrificing margins.',
        metric: `${margin}% margin`,
        priority: 'low',
        icon: 'check'
      });
    } else if (margin > 0) {
      insights.push({
        type: 'warning',
        title: 'Margin Improvement Opportunity',
        text: `Your ${margin}% margin is below the 12% industry standard. Small improvements could significantly impact bottom line.`,
        action: 'Review vehicle acquisition costs and identify suppliers with better pricing. Consider value-added services (warranties, financing).',
        metric: `Need +${(12 - margin).toFixed(1)}% to reach target`,
        priority: 'high',
        icon: 'trending-up'
      });
    } else if (margin < 0) {
      insights.push({
        type: 'danger',
        title: 'URGENT: Negative Profitability',
        text: `You're losing M${Math.abs(netProfit).toLocaleString()} this period. Immediate action required.`,
        action: 'FREEZE non-essential spending. Renegotiate rent/utilities. Increase vehicle prices by 5-10%. Review each expense line item.',
        metric: `Loss of M${Math.abs(netProfit).toLocaleString()}`,
        priority: 'critical',
        icon: 'alert'
      });
    }

    // ============================================
    // 2. REVENUE GROWTH OPPORTUNITIES
    // ============================================
    const revenueGrowthNum = Number(revenueGrowth);

    if (revenueGrowthNum > 15) {
      insights.push({
        type: 'success',
        title: 'Strong Revenue Growth',
        text: `Revenue grew ${revenueGrowthNum}% compared to previous period. Your sales strategy is working.`,
        action: 'Double down on what\'s working. Analyze which marketing channels or sales tactics drove this growth and increase investment there.',
        metric: `+${revenueGrowthNum}% growth`,
        priority: 'low',
        icon: 'trending-up'
      });
    } else if (revenueGrowthNum > 0) {
      insights.push({
        type: 'neutral',
        title: 'Modest Revenue Growth',
        text: `Revenue increased ${revenueGrowthNum}% period-over-period. Steady but room for acceleration.`,
        action: 'Test a small marketing campaign (M2,000-3,000) on Facebook Marketplace or local WhatsApp groups to boost visibility.',
        metric: `+${revenueGrowthNum}% growth`,
        priority: 'medium',
        icon: 'trending-up'
      });
    } else if (revenueGrowthNum < 0) {
      insights.push({
        type: 'warning',
        title: 'Revenue Decline Alert',
        text: `Revenue dropped ${Math.abs(revenueGrowthNum)}% from previous period. Customer acquisition may be slowing.`,
        action: 'Launch a limited-time promotion: "M5,000 discount on all vehicles over M80,000" for 14 days. Track response rate.',
        metric: `${revenueGrowthNum}% decline`,
        priority: 'high',
        icon: 'trending-down'
      });
    }

    // ============================================
    // 3. INVENTORY & STOCK MANAGEMENT
    // ============================================
    const turnover = Number(inventoryTurnover);
    const targetTurnover = 4; // Industry target for used cars (4x per year)

    if (turnover >= targetTurnover) {
      insights.push({
        type: 'success',
        title: 'Excellent Inventory Turnover',
        text: `Your inventory turns over ${turnover}x per year, faster than industry average. You're not holding dead stock.`,
        action: 'Consider increasing inventory levels by 20% - your sales velocity can support more units without carrying costs.',
        metric: `${turnover}x turnover (Target: ${targetTurnover}x)`,
        priority: 'low',
        icon: 'truck'
      });
    } else if (turnover >= 2) {
      insights.push({
        type: 'neutral',
        title: 'Average Inventory Turnover',
        text: `Your inventory turns over ${turnover}x annually. Some vehicles may be sitting too long.`,
        action: 'Identify vehicles older than 60 days and mark them down 5-10% to free up cash for faster-selling models.',
        metric: `${turnover}x turnover`,
        priority: 'medium',
        icon: 'clock'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Slow Inventory Movement',
        text: `Inventory only turns over ${turnover}x per year. Cash is tied up in slow-selling stock.`,
        action: 'Conduct a 30-day clearance sale on all vehicles older than 90 days. Use proceeds to buy popular, fast-selling makes/models.',
        metric: `${turnover}x turnover (Target: ${targetTurnover}x)`,
        priority: 'high',
        icon: 'alert'
      });
    }

    // ============================================
    // 4. CASH FLOW & PAYMENT TERMS
    // ============================================
    const installmentPct = Number(installmentPercentage);

    if (installmentPct > 50) {
      insights.push({
        type: 'warning',
        title: 'Cash Flow Risk Detected',
        text: `${installmentPct}% of revenue comes from installment payments. This delays cash collection.`,
        action: 'Offer a 3% discount for cash/bank transfer payments to encourage faster payment. Tighten installment collection follow-up.',
        metric: `${installmentPct}% installment sales`,
        priority: 'high',
        icon: 'dollar'
      });
    } else if (installmentPct > 25) {
      insights.push({
        type: 'neutral',
        title: 'Balanced Payment Mix',
        text: `${installmentPct}% installments provides steady recurring revenue while maintaining healthy cash flow.`,
        action: 'Implement automated payment reminders via WhatsApp to reduce late payments on installment accounts.',
        metric: `${100 - installmentPct}% immediate cash`,
        priority: 'low',
        icon: 'check'
      });
    }

    // ============================================
    // 5. SALES TEAM PERFORMANCE
    // ============================================
    if (topSalespersons.length > 1) {
      const [topRep, topAmount] = topSalespersons[0];
      const [secondRep, secondAmount] = topSalespersons[1];
      const gap = ((topAmount - secondAmount) / secondAmount * 100).toFixed(0);

      if (gap > 50) {
        insights.push({
          type: 'neutral',
          title: 'Sales Talent Gap Identified',
          text: `${topRep} generates ${gap}% more revenue than the next top performer. Your team has untapped potential.`,
          action: `Have ${topRep} mentor other sales staff for 2 hours weekly. Create a sales contest with M2,000 bonus for the top performer.`,
          metric: `${gap}% performance gap`,
          priority: 'medium',
          icon: 'users'
        });
      }
    }

    // ============================================
    // 6. EXPENSE OPTIMIZATION
    // ============================================
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    if (expenseRatio > 50) {
      insights.push({
        type: 'danger',
        title: 'High Operating Costs',
        text: `Expenses consume ${expenseRatio.toFixed(1)}% of revenue. This is unsustainable for growth.`,
        action: 'Audit top 3 expense categories. Negotiate with suppliers. Consider shared workspace or remote work for admin staff.',
        metric: `${expenseRatio.toFixed(1)}% expense ratio`,
        priority: 'critical',
        icon: 'alert'
      });
    } else if (expenseRatio > 35) {
      insights.push({
        type: 'warning',
        title: 'Expense Efficiency Opportunity',
        text: `At ${expenseRatio.toFixed(1)}%, expenses are above the 30% target for optimal dealerships.`,
        action: 'Review utilities, internet, and software subscriptions. Small 5-10% reductions here add M${(totalExpenses * 0.05).toFixed(0).toLocaleString()} to profit.',
        metric: `${expenseRatio.toFixed(1)}% of revenue`,
        priority: 'medium',
        icon: 'trending-down'
      });
    }

    // ============================================
    // 7. SALES VOLUME & AVERAGE TICKET
    // ============================================
    const avgSale = averageSaleValue;
    const monthlyVolume = filteredSales.length;

    if (monthlyVolume < 30 && totalRevenue > 0) {
      insights.push({
        type: 'neutral',
        title: 'Volume Growth Opportunity',
        text: `You're selling ${monthlyVolume} vehicles per month. Increasing volume spreads fixed costs across more units.`,
        action: 'Partner with local taxi associations or fleet operators. Offer a M1,000 referral fee for customer referrals.',
        metric: `${monthlyVolume} vehicles/month`,
        priority: 'medium',
        icon: 'truck'
      });
    }

    // ============================================
    // 8. TOP PERFORMING PRODUCTS
    // ============================================
    if (topMakes.length > 0) {
      const [topMake, topAmount] = topMakes[0];
      const topPercent = (topAmount / totalRevenue * 100).toFixed(0);

      insights.push({
        type: 'success',
        title: `Your Best-Selling Brand: ${topMake}`,
        text: `${topMake} generates ${topPercent}% of your revenue (M${topAmount.toLocaleString()}). This is your cash cow.`,
        action: `Increase ${topMake} inventory by 25%. These vehicles sell faster and at better margins than other brands.`,
        metric: `${topPercent}% of revenue`,
        priority: 'low',
        icon: 'target'
      });
    }

    // Limit to top 6 most important insights
    return insights.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 6);
  };

  // ============================================
  // GROWTH RECOMMENDATIONS - ACTIONABLE NEXT STEPS
  // ============================================
  const generateGrowthRecommendations = () => {
    const recommendations = [];

    // Recommendation 1: Increase average transaction value
    recommendations.push({
      title: 'Boost Average Sale Value',
      description: 'Current average sale is M${averageSaleValue.toLocaleString()}. Adding just M5,000 per sale increases revenue by M${(filteredSales.length * 5000).toLocaleString()}.',
      steps: [
        'Offer financing options through partner banks',
        'Bundle extended warranty (M3,000-5,000 extra)',
        'Upsell accessories (floor mats, window tint, sound systems)'
      ],
      potentialImpact: `+M${(filteredSales.length * 5000).toLocaleString()} revenue`,
      effort: 'Low',
      roi: 'High'
    });

    // Recommendation 2: Reduce days inventory
    recommendations.push({
      title: 'Accelerate Inventory Turnover',
      description: `Current inventory value is M${totalInventoryValue.toLocaleString()}. Reducing holding days by 15 days frees M${(totalInventoryValue * 0.1).toLocaleString()} in cash.`,
      steps: [
        'Price check against competitor listings weekly',
        'Run "Weekend Specials" on vehicles over 45 days',
        'List vehicles on Facebook Marketplace daily'
      ],
      potentialImpact: `+M${(totalInventoryValue * 0.1).toLocaleString()} cash freed`,
      effort: 'Medium',
      roi: 'High'
    });

    // Recommendation 3: Customer retention program
    recommendations.push({
      title: 'Build Repeat Customer Base',
      description: 'Acquisition is expensive. Retention is free. Implement a customer follow-up system.',
      steps: [
        'Call every buyer 30 days after purchase for satisfaction check',
        'Offer M1,000 trade-in bonus for returning customers',
        'Send birthday/anniversary SMS with service discount'
      ],
      potentialImpact: '20-30% repeat customer rate in 6 months',
      effort: 'Low',
      roi: 'Very High'
    });

    return recommendations;
  };

  if (loading && sales.length === 0 && expenses.length === 0) {
    return (
      <div className="financial-wrapper">
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="financial-main">
          <div className="mobile-header">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div className="mobile-logo"><span>AUTO</span><span>LAND</span></div>
            <div style={{ width: 40 }} />
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="financial-main">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="mobile-logo"><span>AUTO</span><span>LAND</span></div>
          <div style={{ width: 40 }} />
        </div>

        {/* Header */}
        <div className="financial-header">
          <div>
            <h1 className="financial-title">Business Intelligence Dashboard</h1>
            <p className="financial-subtitle">
              Actionable insights to drive revenue growth and operational efficiency
              {lastUpdated && (
                <span className="last-updated">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button onClick={fetchData} className="refresh-btn" disabled={loading}>
            {loading ? <><FiRefreshCw size={14} className="spin" /> Refreshing...</> : <><FiRefreshCw size={14} /> Refresh Data</>}
          </button>
        </div>

        {/* Period Comparison Summary */}
        {(totalRevenue > 0 || totalExpenses > 0) && (
          <div className="comparison-summary">
            <div className="comparison-header">
              <FiBarChart2 size={16} />
              <span>Period-over-Period Performance</span>
            </div>
            <div className="comparison-grid">
              <div className="comparison-item">
                <span className="comparison-label">Revenue</span>
                <span className={`comparison-value ${revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}%
                </span>
                <span className="comparison-detail">M{totalRevenue.toLocaleString()} vs M{prevTotalRevenue.toLocaleString()}</span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Profit</span>
                <span className={`comparison-value ${profitGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {profitGrowth >= 0 ? '↑' : '↓'} {Math.abs(profitGrowth)}%
                </span>
                <span className="comparison-detail">M{netProfit.toLocaleString()} vs M{prevNetProfit.toLocaleString()}</span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Sales Volume</span>
                <span className={`comparison-value ${filteredSales.length >= prevFilteredSales.length ? 'positive' : 'negative'}`}>
                  {filteredSales.length >= prevFilteredSales.length ? '↑' : '↓'} {Math.abs(filteredSales.length - prevFilteredSales.length)}
                </span>
                <span className="comparison-detail">{filteredSales.length} vs {prevFilteredSales.length} units</span>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon revenue-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value">M{totalRevenue.toLocaleString()}</p>
              <p className={`metric-change ${revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}% from previous period
              </p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon expenses-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Total Expenses</p>
              <p className="metric-value">M{totalExpenses.toLocaleString()}</p>
              <p className="metric-change">{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}% of revenue</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon profit-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Net Profit</p>
              <p className="metric-value">M{netProfit.toLocaleString()}</p>
              <p className="metric-change positive">Margin: {profitMargin}%</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon target-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Inventory Turnover</p>
              <p className="metric-value">{inventoryTurnover}x</p>
              <p className="metric-change">Annual rate</p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* ACTIONABLE INSIGHTS SECTION - FOR DECISIONS */}
        {/* ============================================ */}
        {(totalRevenue > 0 || totalExpenses > 0) && (
          <div className="insights-card">
            <div className="insights-header">
              <h3 className="insights-title"><FiZap size={18} /> Strategic Insights for Decision Making</h3>
              <span className="insights-badge">What to do next</span>
            </div>
            <div className="insights-grid">
              {generateActionableInsights().map((insight, idx) => (
                <div key={idx} className={`insight-item ${insight.type}`}>
                  <div className="insight-title-row">
                    {insight.type === 'success' && <FiCheckCircle className="insight-icon" />}
                    {insight.type === 'warning' && <FiAlertCircle className="insight-icon" />}
                    {insight.type === 'danger' && <FiAlertCircle className="insight-icon" />}
                    {insight.type === 'neutral' && <FiInfo className="insight-icon" />}
                    <span>{insight.title}</span>
                    {insight.priority === 'critical' && <span className="priority-badge critical">CRITICAL</span>}
                    {insight.priority === 'high' && <span className="priority-badge high">HIGH PRIORITY</span>}
                    {insight.metric && <span className="insight-metric">{insight.metric}</span>}
                  </div>
                  <div className="insight-description">{insight.text}</div>
                  <div className="insight-action">
                    <strong>📋 RECOMMENDED ACTION:</strong> {insight.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue & Profit Trend Chart */}
        {(totalRevenue > 0 || totalExpenses > 0) && (
          <>
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Revenue & Profit Trend</h3>
                <div className="chart-legend">
                  <span><span className="legend-dot revenue"></span> Revenue</span>
                  <span><span className="legend-dot expense"></span> Expenses</span>
                  <span><span className="legend-dot profit"></span> Profit</span>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-y-axis">
                  <div className="y-label">Amount (M)</div>
                  {[maxRevenue, maxRevenue * 0.75, maxRevenue * 0.5, maxRevenue * 0.25, 0].map((val, i) => (
                    <div key={i} className="y-tick">M{Math.round(val).toLocaleString()}</div>
                  ))}
                </div>
                <div className="chart-area">
                  <div className="chart-bars">
                    {months.map((month, i) => (
                      <div key={i} className="bar-group">
                        <div
                          className="bar revenue-bar"
                          style={{ height: `${(monthlyRevenue[i] / maxRevenue) * maxChartHeight}px` }}
                          title={`Revenue: M${monthlyRevenue[i].toLocaleString()}`}
                        ></div>
                        <div
                          className="bar expense-bar"
                          style={{ height: `${(monthlyExpenses[i] / maxRevenue) * maxChartHeight}px` }}
                          title={`Expenses: M${monthlyExpenses[i].toLocaleString()}`}
                        ></div>
                        <div
                          className="bar profit-bar"
                          style={{
                            height: `${Math.abs(monthlyProfit[i] / maxRevenue) * maxChartHeight}px`,
                            backgroundColor: monthlyProfit[i] >= 0 ? '#10b981' : '#ef4444'
                          }}
                          title={`Profit: M${monthlyProfit[i].toLocaleString()}`}
                        ></div>
                        <div className="bar-label">{month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* GROWTH RECOMMENDATIONS SECTION */}
            {/* ============================================ */}
            <div className="growth-card">
              <div className="growth-header">
                <h3 className="growth-title"><FiTrendingUp size={18} /> Growth Recommendations</h3>
                <span className="growth-badge">Action Plan</span>
              </div>
              <div className="growth-grid">
                {generateGrowthRecommendations().map((rec, idx) => (
                  <div key={idx} className="growth-item">
                    <div className="growth-item-header">
                      <span className="growth-item-title">{rec.title}</span>
                      <div className="growth-item-metrics">
                        <span className="growth-impact">{rec.potentialImpact}</span>
                        <span className={`growth-effort effort-${rec.effort.toLowerCase()}`}>{rec.effort} effort</span>
                        <span className={`growth-roi roi-${rec.roi.toLowerCase().replace(' ', '-')}`}>{rec.roi} ROI</span>
                      </div>
                    </div>
                    <p className="growth-description">{rec.description}</p>
                    <ul className="growth-steps">
                      {rec.steps.map((step, stepIdx) => (
                        <li key={stepIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Analysis Grid */}
            <div className="two-column-grid">
              {/* Revenue by Payment Method */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Revenue by Payment Method</h3>
                </div>
                <div className="payment-stats">
                  {Object.entries(paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="payment-item">
                      <div className="payment-info">
                        <span className="payment-name">{method}</span>
                        <span className="payment-percent">{paymentTotal > 0 ? ((amount / paymentTotal) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="payment-bar-container">
                        <div className="payment-bar" style={{ width: `${paymentTotal > 0 ? (amount / paymentTotal) * 100 : 0}%` }}></div>
                      </div>
                      <div className="payment-amount">M{amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                {installmentPercentage > 30 && (
                  <div className="payment-insight">
                    <FiClock size={12} /> Tip: Offer 2% discount for cash payments to improve cash flow
                  </div>
                )}
              </div>

              {/* Revenue by Vehicle Make */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Revenue by Vehicle Make</h3>
                </div>
                <div className="make-list">
                  {topMakes.length > 0 ? topMakes.map(([make, amount]) => (
                    <div key={make} className="make-item">
                      <span className="make-name">{make}</span>
                      <div className="make-bar-container">
                        <div className="make-bar" style={{ width: `${(amount / topMakes[0][1]) * 100}%`, backgroundColor: '#0e48f1' }}></div>
                      </div>
                      <span className="make-amount">M{amount.toLocaleString()}</span>
                    </div>
                  )) : <div className="text-center" style={{ padding: '20px' }}>No vehicle sales data</div>}
                </div>
                {topMakes.length > 0 && (
                  <div className="make-insight">
                    <FiTarget size={12} /> Focus on {topMakes[0][0]} - your best-selling brand with {((topMakes[0][1] / totalRevenue) * 100).toFixed(0)}% of revenue
                  </div>
                )}
              </div>
            </div>

            {/* Sales by Salesperson with Performance Insights */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Sales Team Performance</h3>
                <div className="chart-legend">
                  <span>💰 Revenue generated</span>
                  <span>📊 % of total</span>
                </div>
              </div>
              <div className="salesperson-table-container">
                <table className="salesperson-table">
                  <thead>
                    <tr>
                      <th>Salesperson</th>
                      <th>Revenue</th>
                      <th>% of Total</th>
                      <th>Avg per Sale</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSalespersons.map(([name, amount], idx) => {
                      const avgPerSale = filteredSales.filter(s => (s.salesperson || 'Unassigned') === name).length > 0
                        ? amount / filteredSales.filter(s => (s.salesperson || 'Unassigned') === name).length
                        : 0;
                      const performanceRank = idx === 0 ? 'Top Performer' : idx === topSalespersons.length - 1 ? 'Needs Improvement' : 'Solid';
                      return (
                        <tr key={name}>
                          <td>{name}{idx === 0 && <span className="crown-icon"> 👑</span>}</td>
                          <td className="amount">M{amount.toLocaleString()}</td>
                          <td className="percent">{totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0}%</td>
                          <td>M{avgPerSale.toLocaleString()}</td>
                          <td>
                            <span className={`performance-badge ${idx === 0 ? 'top' : idx === topSalespersons.length - 1 ? 'bottom' : 'mid'}`}>
                              {performanceRank}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {topSalespersons.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center">No sales data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {topSalespersons.length > 1 && (
                <div className="salesperson-insight">
                  <FiUsers size={12} /> {topSalespersons[0][0]} generates {((topSalespersons[0][1] / totalRevenue) * 100).toFixed(0)}% of revenue. Consider peer mentoring to level up the team.
                </div>
              )}
            </div>

            {/* Monthly Profit/Loss Table */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Monthly Profit/Loss Analysis</h3>
              </div>
              <div className="profit-table-container">
                <table className="profit-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Revenue</th>
                      <th>Expenses</th>
                      <th>Profit/Loss</th>
                      <th>Margin</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((month, i) => {
                      const status = monthlyProfit[i] > 0 ? (monthlyProfit[i] > 50000 ? 'Excellent' : 'Good') : 'Loss';
                      return (
                        <tr key={month}>
                          <td className="month">{month}</td>
                          <td className="revenue">M{monthlyRevenue[i].toLocaleString()}</td>
                          <td className="expense">M{monthlyExpenses[i].toLocaleString()}</td>
                          <td className={monthlyProfit[i] >= 0 ? 'profit' : 'loss'}>
                            M{monthlyProfit[i].toLocaleString()}
                          </td>
                          <td className={monthlyRevenue[i] > 0 && (monthlyProfit[i] / monthlyRevenue[i] * 100) >= 0 ? 'profit' : 'loss'}>
                            {monthlyRevenue[i] > 0 ? ((monthlyProfit[i] / monthlyRevenue[i]) * 100).toFixed(1) : 0}%
                          </td>
                          <td>
                            <span className={`month-status ${status === 'Excellent' ? 'excellent' : status === 'Good' ? 'good' : 'loss'}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="total-label">Total</td>
                      <td className="total-revenue">M{totalRevenue.toLocaleString()}</td>
                      <td className="total-expense">M{totalExpenses.toLocaleString()}</td>
                      <td className="total-profit">M{netProfit.toLocaleString()}</td>
                      <td className="total-margin">{profitMargin}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quick Wins Section */}
            <div className="quick-wins-card">
              <div className="quick-wins-header">
                <h3 className="quick-wins-title"><FiZap size={16} /> Quick Wins - Implement This Week</h3>
              </div>
              <div className="quick-wins-grid">
                <div className="quick-win-item">
                  <div className="quick-win-number">1</div>
                  <div className="quick-win-content">
                    <h4>Increase Average Sale by M5,000</h4>
                    <p>Offer M2,000 accessory package with M500 profit. Upsell rate of 20% adds M{(filteredSales.length * 500).toLocaleString()} profit.</p>
                  </div>
                </div>
                <div className="quick-win-item">
                  <div className="quick-win-number">2</div>
                  <div className="quick-win-content">
                    <h4>Reduce One Expense Category</h4>
                    <p>Identify one recurring expense and negotiate 10% reduction. Saves M{(totalExpenses * 0.05).toFixed(0).toLocaleString()} annually.</p>
                  </div>
                </div>
                <div className="quick-win-item">
                  <div className="quick-win-number">3</div>
                  <div className="quick-win-content">
                    <h4>Follow Up with Previous Customers</h4>
                    <p>Call {filteredSales.length} past customers for trade-in opportunities. Even 5% response adds M{(filteredSales.length * 0.05 * averageSaleValue).toLocaleString()} revenue.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {totalRevenue === 0 && totalExpenses === 0 && (
          <div className="chart-card">
            <div className="empty-state" style={{ padding: '50px', textAlign: 'center' }}>
              <p>No data available for the selected date range.</p>
              <p className="small">Try adjusting your date range or add some sales/expenses data to see business insights.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}