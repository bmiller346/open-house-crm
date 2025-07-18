import React, { useState } from 'react';
import './WholesalingHub.css';

const WholesalingHub = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Getting Started', icon: 'fas fa-lightbulb' },
    { id: 'finding-deals', name: 'Finding Deals', icon: 'fas fa-home' },
    { id: 'analyzing-deals', name: 'Deal Analysis', icon: 'fas fa-chart-bar' },
    { id: 'contracts', name: 'Contracts & Legal', icon: 'fas fa-file-contract' },
    { id: 'marketing', name: 'Marketing', icon: 'fas fa-users' },
    { id: 'closing', name: 'Closing Deals', icon: 'fas fa-dollar-sign' }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <WholesalingOverview />;
      case 'finding-deals':
        return <FindingDeals />;
      case 'analyzing-deals':
        return <DealAnalysis />;
      case 'contracts':
        return <ContractsAndLegal />;
      case 'marketing':
        return <MarketingStrategies />;
      case 'closing':
        return <ClosingDeals />;
      default:
        return <WholesalingOverview />;
    }
  };

  return (
    <div className="wholesaling-hub">
      {/* Sidebar Navigation */}
      <div className="wholesaling-sidebar">
        <div className="sidebar-header">
          <h2>Wholesaling Guide</h2>
          <p>Complete guide to real estate wholesaling</p>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            >
              <i className={section.icon}></i>
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="wholesaling-content">
        {renderSectionContent()}
      </div>
    </div>
  );
};

const WholesalingOverview = () => {
  return (
    <div className="wholesaling-overview">
      <div className="overview-header">
        <h1>Real Estate Wholesaling Guide</h1>
        <p className="overview-description">
          Master the art of real estate wholesaling with our comprehensive guide. Learn to find, analyze, 
          and assign contracts for consistent profits.
        </p>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <h3>What is Wholesaling?</h3>
          <p>
            Wholesaling is the process of getting a property under contract and then assigning that contract 
            to an end buyer for a fee. It's a low-risk way to get started in real estate investing.
          </p>
        </div>
        
        <div className="overview-card">
          <h3>Why Wholesale?</h3>
          <ul>
            <li>Low startup costs</li>
            <li>No need for credit or financing</li>
            <li>Quick turnaround (30-45 days)</li>
            <li>Learn the market without ownership</li>
          </ul>
        </div>
      </div>

      <div className="process-steps">
        <h2>The Wholesaling Process</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Find Motivated Sellers</h4>
              <p>Use marketing strategies to locate property owners who need to sell quickly.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Analyze the Deal</h4>
              <p>Determine ARV, repair costs, and calculate your maximum allowable offer.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Get Property Under Contract</h4>
              <p>Negotiate and execute a purchase agreement with assignable language.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Find End Buyer</h4>
              <p>Market the property to your investor buyer list for assignment.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Assign Contract & Get Paid</h4>
              <p>Execute assignment agreement and collect your assignment fee at closing.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="legal-notice">
        <div className="notice-header">
          <i className="fas fa-exclamation-triangle"></i>
          Important Legal Considerations
        </div>
        <ul>
          <li>Always use assignable contracts</li>
          <li>Disclose your intentions to all parties</li>
          <li>Follow local and state real estate laws</li>
          <li>Consider consulting with a real estate attorney</li>
          <li>Some states require real estate licenses for wholesaling</li>
        </ul>
      </div>
    </div>
  );
};

const FindingDeals = () => {
  return (
    <div className="finding-deals">
      <h1>Finding Wholesale Deals</h1>
      
      <div className="marketing-strategies">
        <div className="strategy-card">
          <h3>Direct Marketing</h3>
          <ul>
            <li><i className="fas fa-check"></i> Direct mail campaigns to targeted lists</li>
            <li><i className="fas fa-check"></i> Cold calling property owners</li>
            <li><i className="fas fa-check"></i> Text message campaigns</li>
            <li><i className="fas fa-check"></i> Door knocking neighborhoods</li>
          </ul>
        </div>
        
        <div className="strategy-card">
          <h3>Online Marketing</h3>
          <ul>
            <li><i className="fas fa-check"></i> Facebook and Google ads</li>
            <li><i className="fas fa-check"></i> SEO-optimized website</li>
            <li><i className="fas fa-check"></i> Social media marketing</li>
            <li><i className="fas fa-check"></i> Email marketing campaigns</li>
          </ul>
        </div>
      </div>

      <div className="lead-sources">
        <h2>Best Lead Sources</h2>
        <div className="sources-grid">
          <div className="source-card">
            <h4>Pre-Foreclosures</h4>
            <p>Homeowners facing foreclosure often need quick solutions.</p>
          </div>
          
          <div className="source-card">
            <h4>Probate Properties</h4>
            <p>Inherited properties that heirs want to sell quickly.</p>
          </div>
          
          <div className="source-card">
            <h4>Divorce Situations</h4>
            <p>Couples needing to liquidate assets quickly.</p>
          </div>
          
          <div className="source-card">
            <h4>Tax Delinquent</h4>
            <p>Properties with unpaid taxes requiring quick sale.</p>
          </div>
          
          <div className="source-card">
            <h4>Absentee Owners</h4>
            <p>Out-of-state owners tired of managing properties.</p>
          </div>
          
          <div className="source-card">
            <h4>Expired Listings</h4>
            <p>Properties that failed to sell through traditional methods.</p>
          </div>
        </div>
      </div>

      <div className="pro-tips">
        <h2>Pro Tips for Finding Deals</h2>
        <ul>
          <li>Build relationships with real estate agents who work with investors</li>
          <li>Network with other wholesalers and investors</li>
          <li>Drive neighborhoods looking for distressed properties</li>
          <li>Use public records to find motivated sellers</li>
          <li>Focus on specific geographic areas to become the local expert</li>
        </ul>
      </div>
    </div>
  );
};

const DealAnalysis = () => {
  return (
    <div className="deal-analysis">
      <h1>Deal Analysis Framework</h1>
      
      <div className="rule-section">
        <h2>The 70% Rule</h2>
        <div className="formula">
          <code>Maximum Offer = (ARV × 70%) - Repair Costs</code>
        </div>
        <p>
          This is a quick formula used by investors to determine the maximum amount they should pay for a property. 
          The 70% accounts for holding costs, financing, profit margin, and unexpected expenses.
        </p>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h3>ARV Calculation</h3>
          <table>
            <tbody>
              <tr>
                <td>Recent Comparable Sales</td>
                <td>3-6 months</td>
              </tr>
              <tr>
                <td>Distance from Subject</td>
                <td>≤ 1 mile</td>
              </tr>
              <tr>
                <td>Property Type</td>
                <td>Same style</td>
              </tr>
              <tr>
                <td>Square Footage</td>
                <td>±200 sq ft</td>
              </tr>
              <tr>
                <td>Bedrooms/Bathrooms</td>
                <td>Same count</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="analysis-card">
          <h3>Repair Estimates</h3>
          <table>
            <tbody>
              <tr>
                <td>Kitchen Remodel</td>
                <td>$15,000-$25,000</td>
              </tr>
              <tr>
                <td>Bathroom Remodel</td>
                <td>$8,000-$15,000</td>
              </tr>
              <tr>
                <td>Flooring (per sq ft)</td>
                <td>$3-$8</td>
              </tr>
              <tr>
                <td>Paint (interior)</td>
                <td>$2,000-$4,000</td>
              </tr>
              <tr>
                <td>HVAC System</td>
                <td>$5,000-$12,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="checklist-section">
        <h2>Deal Analysis Checklist</h2>
        <div className="checklist-grid">
          <div className="checklist-card">
            <h4>Property Research</h4>
            <ul>
              <li>□ Verified ownership</li>
              <li>□ Checked property taxes</li>
              <li>□ Researched neighborhood</li>
              <li>□ Verified zoning</li>
              <li>□ Checked for liens</li>
            </ul>
          </div>
          
          <div className="checklist-card">
            <h4>Financial Analysis</h4>
            <ul>
              <li>□ Calculated ARV</li>
              <li>□ Estimated repair costs</li>
              <li>□ Applied 70% rule</li>
              <li>□ Determined assignment fee</li>
              <li>□ Verified buyer demand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractsAndLegal = () => {
  return (
    <div className="contracts-legal">
      <h1>Contracts & Legal Considerations</h1>
      
      <div className="legal-disclaimer">
        <div className="disclaimer-header">
          <i className="fas fa-exclamation-triangle"></i>
          Legal Disclaimer
        </div>
        <p>
          This information is for educational purposes only. Always consult with a qualified real estate attorney 
          in your area before executing any contracts or legal documents.
        </p>
      </div>

      <div className="contracts-grid">
        <div className="contract-card">
          <h3>Purchase Agreement Essentials</h3>
          <ul>
            <li><i className="fas fa-check"></i> Assignable language included</li>
            <li><i className="fas fa-check"></i> Inspection contingency period</li>
            <li><i className="fas fa-check"></i> Financing contingency</li>
            <li><i className="fas fa-check"></i> Clear title requirements</li>
            <li><i className="fas fa-check"></i> Earnest money deposit terms</li>
          </ul>
        </div>
        
        <div className="contract-card">
          <h3>Assignment Agreement</h3>
          <ul>
            <li><i className="fas fa-check"></i> Original contract reference</li>
            <li><i className="fas fa-check"></i> Assignment fee amount</li>
            <li><i className="fas fa-check"></i> Assignee responsibilities</li>
            <li><i className="fas fa-check"></i> Closing date requirements</li>
            <li><i className="fas fa-check"></i> Default provisions</li>
          </ul>
        </div>
      </div>

      <div className="key-clauses">
        <h2>Key Contract Clauses</h2>
        <div className="clause-card">
          <h4>Assignment Clause</h4>
          <blockquote>
            "This agreement is assignable by the buyer to any person, corporation, or entity of buyer's choice."
          </blockquote>
        </div>
        
        <div className="clause-card">
          <h4>Inspection Contingency</h4>
          <blockquote>
            "This contract is contingent upon buyer's approval of property inspection within 10 days of contract execution."
          </blockquote>
        </div>
        
        <div className="clause-card">
          <h4>Financing Contingency</h4>
          <blockquote>
            "This contract is contingent upon buyer obtaining satisfactory financing within 21 days of contract execution."
          </blockquote>
        </div>
      </div>

      <div className="state-considerations">
        <h2>Legal Considerations by State</h2>
        <ul>
          <li>Some states require real estate licenses for wholesaling activities</li>
          <li>Disclosure requirements vary by jurisdiction</li>
          <li>Assignment fees may be subject to specific regulations</li>
          <li>Always verify local and state laws before conducting business</li>
          <li>Consider forming an LLC for liability protection</li>
        </ul>
      </div>
    </div>
  );
};

const MarketingStrategies = () => {
  return (
    <div className="marketing-strategies">
      <h1>Marketing Strategies for Wholesalers</h1>
      
      <div className="marketing-grid">
        <div className="marketing-card">
          <h3>Seller Marketing</h3>
          <div className="strategy-item">
            <h4>Direct Mail</h4>
            <span className="roi-badge">High ROI</span>
          </div>
          <div className="strategy-item">
            <h4>Cold Calling</h4>
            <span className="roi-badge">Medium ROI</span>
          </div>
          <div className="strategy-item">
            <h4>Online Ads</h4>
            <span className="roi-badge">Scalable</span>
          </div>
          <div className="strategy-item">
            <h4>Bandit Signs</h4>
            <span className="roi-badge">Check Local Laws</span>
          </div>
        </div>
        
        <div className="marketing-card">
          <h3>Buyer Marketing</h3>
          <div className="strategy-item">
            <h4>Investor Meetups</h4>
            <span className="roi-badge">High Quality</span>
          </div>
          <div className="strategy-item">
            <h4>Email Lists</h4>
            <span className="roi-badge">Automated</span>
          </div>
          <div className="strategy-item">
            <h4>Facebook Groups</h4>
            <span className="roi-badge">Free</span>
          </div>
          <div className="strategy-item">
            <h4>Wholesaling Websites</h4>
            <span className="roi-badge">Professional</span>
          </div>
        </div>
      </div>

      <div className="sample-materials">
        <h2>Sample Marketing Materials</h2>
        
        <div className="sample-card">
          <h4>Direct Mail Postcard</h4>
          <div className="sample-content">
            <strong>We Buy Houses FAST!</strong><br />
            • Any Condition • Any Situation<br />
            • No Fees • No Commissions<br />
            • Close in 7 Days<br />
            Call Today: (555) 123-4567
          </div>
        </div>
        
        <div className="sample-card">
          <h4>Cold Calling Script</h4>
          <div className="sample-content">
            "Hi, this is [Name] with [Company]. I'm calling about your property at [Address]. 
            I'm a local real estate investor and I'm interested in making you a cash offer. 
            Would you be interested in selling?"
          </div>
        </div>
        
        <div className="sample-card">
          <h4>Email to Buyers</h4>
          <div className="sample-content">
            <strong>Subject: New Deal - 3BR/2BA - $45K</strong><br />
            Property: 123 Main St, Anytown, ST 12345<br />
            ARV: $85,000 | Repairs: $15,000 | Price: $45,000<br />
            Built: 1985 | Sqft: 1,200 | Lot: 0.25 acre<br />
            Contact me immediately if interested!
          </div>
        </div>
      </div>

      <div className="budget-allocation">
        <h2>Marketing Budget Allocation</h2>
        
        <div className="budget-grid">
          <div className="budget-card">
            <h4>New Wholesaler (Monthly)</h4>
            <ul>
              <li>Direct Mail: $500-$1,000</li>
              <li>Online Ads: $300-$500</li>
              <li>Networking Events: $100-$200</li>
              <li>Website/SEO: $200-$400</li>
            </ul>
          </div>
          
          <div className="budget-card">
            <h4>Experienced Wholesaler (Monthly)</h4>
            <ul>
              <li>Direct Mail: $2,000-$5,000</li>
              <li>Online Ads: $1,000-$2,000</li>
              <li>Cold Calling Service: $500-$1,000</li>
              <li>Marketing Automation: $300-$600</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClosingDeals = () => {
  return (
    <div className="closing-deals">
      <h1>Closing Wholesale Deals</h1>
      
      <div className="timeline-section">
        <h2>Assignment Process Timeline</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-number">1</div>
            <div className="timeline-content">
              <h4>Property Under Contract</h4>
              <p>Execute purchase agreement with seller</p>
              <span className="timeline-date">Day 1</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">2</div>
            <div className="timeline-content">
              <h4>Market to Buyers</h4>
              <p>Send property details to buyer list</p>
              <span className="timeline-date">Days 1-7</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">3</div>
            <div className="timeline-content">
              <h4>Negotiate Assignment</h4>
              <p>Agree on assignment fee with end buyer</p>
              <span className="timeline-date">Days 7-14</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">4</div>
            <div className="timeline-content">
              <h4>Execute Assignment</h4>
              <p>Sign assignment agreement</p>
              <span className="timeline-date">Day 14</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">5</div>
            <div className="timeline-content">
              <h4>Closing Day</h4>
              <p>Collect assignment fee at closing</p>
              <span className="timeline-date">Day 21-30</span>
            </div>
          </div>
        </div>
      </div>

      <div className="closing-grid">
        <div className="closing-card">
          <h3>Closing Checklist</h3>
          <ul>
            <li><i className="fas fa-check"></i> Assignment agreement signed</li>
            <li><i className="fas fa-check"></i> Assignment fee agreed upon</li>
            <li><i className="fas fa-check"></i> Buyer's proof of funds verified</li>
            <li><i className="fas fa-check"></i> Title company coordinated</li>
            <li><i className="fas fa-check"></i> All parties notified of closing</li>
            <li><i className="fas fa-check"></i> Closing documents prepared</li>
          </ul>
        </div>
        
        <div className="closing-card">
          <h3>Common Closing Issues</h3>
          <div className="issue-item">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Buyer Financing Falls Through</strong>
              <p>Always have backup buyers ready</p>
            </div>
          </div>
          <div className="issue-item">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Title Issues</strong>
              <p>Order title search early in process</p>
            </div>
          </div>
          <div className="issue-item">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Inspection Surprises</strong>
              <p>Account for unknown repairs in offer</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fee-maximization">
        <h2>Maximizing Your Assignment Fees</h2>
        
        <div className="fee-grid">
          <div className="fee-card">
            <h4>Market Factors</h4>
            <ul>
              <li>Hot market = Higher fees</li>
              <li>Unique properties = Premium</li>
              <li>Multiple buyers = Bidding war</li>
              <li>Quick closing = Convenience fee</li>
            </ul>
          </div>
          
          <div className="fee-card">
            <h4>Typical Fee Ranges</h4>
            <ul>
              <li>Starter homes: $2,000-$5,000</li>
              <li>Mid-range properties: $5,000-$10,000</li>
              <li>High-end properties: $10,000+</li>
              <li>Commercial deals: $20,000+</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalingHub;
