'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Analytics,
  AttachMoney,
  Home,
  Group,
  Description,
  EmojiObjects,
  Warning,
  CheckCircle,
} from '@mui/icons-material'; // Using Material-UI icons

// Helper to render MUI icons
const renderIcon = (IconComponent: React.ElementType, props: any = {}) => <IconComponent {...props} />;


interface WholesalingHubProps {
  searchTerm: string;
  selectedCategory: string;
}

export function WholesalingHub({ searchTerm, selectedCategory }: WholesalingHubProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Getting Started', icon: EmojiObjects },
    { id: 'finding-deals', name: 'Finding Deals', icon: Home },
    { id: 'analyzing-deals', name: 'Deal Analysis', icon: Analytics },
    { id: 'contracts', name: 'Contracts & Legal', icon: Description },
    { id: 'marketing', name: 'Marketing', icon: Group },
    { id: 'closing', name: 'Closing Deals', icon: AttachMoney },
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
    <Grid container spacing={3}>
      {/* Sidebar Navigation */}
      <Grid item xs={12} md={3}>
        <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 80 }}>
          <Typography variant="h6" gutterBottom>Wholesaling Guide</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete guide to real estate wholesaling
          </Typography>
          <List>
            {sections.map((section) => (
              <ListItem key={section.id} disablePadding>
                <ListItemButton
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  <ListItemIcon>{renderIcon(section.icon, { color: activeSection === section.id ? 'primary.main' : 'inherit' })}</ListItemIcon>
                  <ListItemText primary={section.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Content Area */}
      <Grid item xs={12} md={9}>
        {renderSectionContent()}
      </Grid>
    </Grid>
  );
}

function WholesalingOverview() {
  const steps = [
    { label: 'Find Motivated Sellers', description: 'Use marketing strategies to locate property owners who need to sell quickly.' },
    { label: 'Analyze the Deal', description: 'Determine ARV, repair costs, and calculate your maximum allowable offer.' },
    { label: 'Get Property Under Contract', description: 'Negotiate and execute a purchase agreement with assignable language.' },
    { label: 'Find End Buyer', description: 'Market the property to your investor buyer list for assignment.' },
    { label: 'Assign Contract & Get Paid', description: 'Execute assignment agreement and collect your assignment fee at closing.' },
  ];

  return (
    <Box>
      <Paper sx={{ p: 4, mb: 3, backgroundColor: 'primary.dark', color: 'primary.contrastText' }}>
        <Typography variant="h4" component="h2" gutterBottom>Real Estate Wholesaling Guide</Typography>
        <Typography variant="body1">
          Master the art of real estate wholesaling with our comprehensive guide. Learn to find, analyze, and assign contracts for consistent profits.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>What is Wholesaling?</Typography>
              <Typography variant="body2" color="text.secondary">
                Wholesaling is the process of getting a property under contract and then assigning that contract to an end buyer for a fee. It's a low-risk way to get started in real estate investing.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Why Wholesale?</Typography>
              <List dense>
                {['Low startup costs', 'No need for credit or financing', 'Quick turnaround (30-45 days)', 'Learn the market without ownership'].map(item => (
                  <ListItem key={item}><ListItemIcon>{renderIcon(CheckCircle, { color: 'success.main' })}</ListItemIcon><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>The Wholesaling Process</Typography>
          <Stepper activeStep={-1} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} active>
                <StepLabel icon={<Typography sx={{ color: 'primary.main' }}>{index + 1}</Typography>}>
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={renderIcon(Warning)}>
        <AlertTitle>Important Legal Considerations</AlertTitle>
        <List dense>
          {['Always use assignable contracts', 'Disclose your intentions to all parties', 'Follow local and state real estate laws', 'Consider consulting with a real estate attorney', 'Some states require real estate licenses for wholesaling'].map(item => (
            <ListItem key={item} sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}><ListItemText primary={item} /></ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
}

function FindingDeals() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Finding Wholesale Deals</Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Direct Marketing</Typography>
              <List dense>
                {['Direct mail campaigns to targeted lists', 'Cold calling property owners', 'Text message campaigns', 'Door knocking neighborhoods'].map(item => (
                  <ListItem key={item}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Online Marketing</Typography>
              <List dense>
                {['Facebook and Google ads', 'SEO-optimized website', 'Social media marketing', 'Email marketing campaigns'].map(item => (
                  <ListItem key={item}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Best Lead Sources</Typography>
          <Grid container spacing={2}>
            { [
              { title: 'Pre-Foreclosures', desc: 'Homeowners facing foreclosure often need quick solutions.' },
              { title: 'Probate Properties', desc: 'Inherited properties that heirs want to sell quickly.' },
              { title: 'Divorce Situations', desc: 'Couples needing to liquidate assets quickly.' },
              { title: 'Tax Delinquent', desc: 'Properties with unpaid taxes requiring quick sale.' },
              { title: 'Absentee Owners', desc: 'Out-of-state owners tired of managing properties.' },
              { title: 'Expired Listings', desc: 'Properties that failed to sell through traditional methods.' },
            ].map(source => (
              <Grid item xs={12} sm={6} key={source.title}>
                <Typography variant="subtitle1" component="div">{source.title}</Typography>
                <Typography variant="body2" color="text.secondary">{source.desc}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Alert severity="info" icon={renderIcon(EmojiObjects)}>
        <AlertTitle>Pro Tips for Finding Deals</AlertTitle>
        <List dense>
          {['Build relationships with real estate agents who work with investors', 'Network with other wholesalers and investors', 'Drive neighborhoods looking for distressed properties', 'Use public records to find motivated sellers', 'Focus on specific geographic areas to become the local expert'].map(item => (
            <ListItem key={item} sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}><ListItemText primary={item} /></ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
}

function DealAnalysis() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Deal Analysis Framework</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>The 70% Rule</Typography>
          <Paper variant="outlined" sx={{ p: 2, my: 2, backgroundColor: 'grey.100' }}>
            <Typography variant="h6" align="center" sx={{ fontStyle: 'italic' }}>
              Maximum Offer = (ARV × 70%) - Repair Costs
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            This is a quick formula used by investors to determine the maximum amount they should pay for a property. The 70% accounts for holding costs, financing, profit margin, and unexpected expenses.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ARV Calculation</Typography>
              <List dense>
                {['Recent Comparable Sales: 3-6 months', 'Distance from Subject: ≤ 1 mile', 'Property Type: Same style', 'Square Footage: ±200 sq ft', 'Bedrooms/Bathrooms: Same count'].map(item => (
                  <ListItem key={item}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Repair Estimates</Typography>
              <List dense>
                {['Kitchen Remodel: $15,000-$25,000', 'Bathroom Remodel: $8,000-$15,000', 'Flooring (per sq ft): $3-$8', 'Paint (interior): $2,000-$4,000', 'HVAC System: $5,000-$12,000'].map(item => (
                  <ListItem key={item}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Deal Analysis Checklist</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Property Research</Typography>
              <List dense>
                {['Verified ownership', 'Checked property taxes', 'Researched neighborhood', 'Verified zoning', 'Checked for liens'].map(item => (
                  <ListItem key={item}><ListItemIcon>{renderIcon(CheckCircle, { color: 'action.active' })}</ListItemIcon><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Financial Analysis</Typography>
              <List dense>
                {['Calculated ARV', 'Estimated repair costs', 'Applied 70% rule', 'Determined assignment fee', 'Verified buyer demand'].map(item => (
                  <ListItem key={item}><ListItemIcon>{renderIcon(CheckCircle, { color: 'action.active' })}</ListItemIcon><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

function ContractsAndLegal() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Contracts & Legal Considerations</Typography>
      <Alert severity="error" icon={renderIcon(Warning)} sx={{ mb: 3 }}>
        <AlertTitle>Legal Disclaimer</AlertTitle>
        This information is for educational purposes only. Always consult with a qualified real estate attorney in your area before executing any contracts or legal documents.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Purchase Agreement Essentials</Typography>
              <List dense>
                {['Assignable language included', 'Inspection contingency period', 'Financing contingency', 'Clear title requirements', 'Earnest money deposit terms'].map(item => (
                  <ListItem key={item}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Assignment Agreement</Typography>
              <List dense>
                {['Original contract reference', 'Assignment fee amount', 'Assignee responsibilities', 'Closing date requirements', 'Default provisions'].map(item => (
                  <ListItem key={item}><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Key Contract Clauses</Typography>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Assignment Clause</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, fontStyle: 'italic', backgroundColor: 'grey.100' }}>"This agreement is assignable by the buyer to any person, corporation, or entity of buyer's choice."</Paper>
            <Typography variant="subtitle1" gutterBottom>Inspection Contingency</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, fontStyle: 'italic', backgroundColor: 'grey.100' }}>"This contract is contingent upon buyer's approval of property inspection within 10 days of contract execution."</Paper>
            <Typography variant="subtitle1" gutterBottom>Financing Contingency</Typography>
            <Paper variant="outlined" sx={{ p: 2, fontStyle: 'italic', backgroundColor: 'grey.100' }}>"This contract is contingent upon buyer obtaining satisfactory financing within 21 days of contract execution."</Paper>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={renderIcon(EmojiObjects)}>
        <AlertTitle>Legal Considerations by State</AlertTitle>
        <List dense>
          {['Some states require real estate licenses for wholesaling activities', 'Disclosure requirements vary by jurisdiction', 'Assignment fees may be subject to specific regulations', 'Always verify local and state laws before conducting business', 'Consider forming an LLC for liability protection'].map(item => (
            <ListItem key={item} sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}><ListItemText primary={item} /></ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
}

function MarketingStrategies() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Marketing Strategies for Wholesalers</Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Seller Marketing</Typography>
              <List>
                {[{ title: 'Direct Mail', roi: 'High ROI' }, { title: 'Cold Calling', roi: 'Medium ROI' }, { title: 'Online Ads', roi: 'Scalable' }, { title: 'Bandit Signs', roi: 'Check Local Laws' }].map(item => (
                  <ListItem key={item.title} secondaryAction={<Chip label={item.roi} size="small" />}>
                    <ListItemText primary={item.title} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Buyer Marketing</Typography>
              <List>
                {[{ title: 'Investor Meetups', quality: 'High Quality' }, { title: 'Email Lists', quality: 'Automated' }, { title: 'Facebook Groups', quality: 'Free' }, { title: 'Wholesaling Websites', quality: 'Professional' }].map(item => (
                  <ListItem key={item.title} secondaryAction={<Chip label={item.quality} size="small" />}>
                    <ListItemText primary={item.title} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Sample Marketing Materials</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Direct Mail Postcard</Typography>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6">We Buy Houses FAST!</Typography>
                <Typography variant="body2">• Any Condition • Any Situation</Typography>
                <Typography variant="body2">• No Fees • No Commissions</Typography>
                <Typography variant="body2">• Close in 7 Days</Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>Call Today: (555) 123-4567</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Cold Calling Script</Typography>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', fontStyle: 'italic' }}>
                "Hi, this is [Name] with [Company]. I'm calling about your property at [Address]. I'm a local real estate investor and I'm interested in making you a cash offer. Would you be interested in selling?"
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Email to Buyers</Typography>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Subject: New Deal - 3BR/2BA - $45K</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">Property: 123 Main St, Anytown, ST 12345</Typography>
                <Typography variant="body2">ARV: $85,000 | Repairs: $15,000 | Price: $45,000</Typography>
                <Typography variant="body2">Built: 1985 | Sqft: 1,200 | Lot: 0.25 acre</Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>Contact me immediately if interested!</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

function ClosingDeals() {
  const steps = [
    { label: 'Property Under Contract', desc: 'Execute purchase agreement with seller', day: 'Day 1' },
    { label: 'Market to Buyers', desc: 'Send property details to buyer list', day: 'Days 1-7' },
    { label: 'Negotiate Assignment', desc: 'Agree on assignment fee with end buyer', day: 'Days 7-14' },
    { label: 'Execute Assignment', desc: 'Sign assignment agreement', day: 'Day 14' },
    { label: 'Closing Day', desc: 'Collect assignment fee at closing', day: 'Day 21-30' },
  ];
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Closing Wholesale Deals</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Assignment Process Timeline</Typography>
          <Stepper activeStep={-1} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} active>
                <StepLabel
                  icon={<Typography sx={{ color: 'primary.main' }}>{index + 1}</Typography>}
                  optional={<Typography variant="caption">{step.day}</Typography>}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography>{step.desc}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Closing Checklist</Typography>
              <List dense>
                {['Assignment agreement signed', 'Assignment fee agreed upon', 'Buyer\'s proof of funds verified', 'Title company coordinated', 'All parties notified of closing', 'Closing documents prepared'].map(item => (
                  <ListItem key={item}><ListItemIcon>{renderIcon(CheckCircle, { color: 'action.active' })}</ListItemIcon><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Common Closing Issues</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>{renderIcon(Warning, { color: 'error.main' })}</ListItemIcon>
                  <ListItemText primary="Buyer Financing Falls Through" secondary="Always have backup buyers ready" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{renderIcon(Warning, { color: 'error.main' })}</ListItemIcon>
                  <ListItemText primary="Title Issues" secondary="Order title search early in process" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{renderIcon(Warning, { color: 'error.main' })}</ListItemIcon>
                  <ListItemText primary="Inspection Surprises" secondary="Account for unknown repairs in offer" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
