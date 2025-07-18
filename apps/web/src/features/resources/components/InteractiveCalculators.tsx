'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';

interface InteractiveCalculatorsProps {
  searchTerm: string;
  selectedCategory: string;
}

interface ARVCalculatorState {
  address: string;
  sqft: string;
  bedrooms: string;
  bathrooms: string;
  comp1: string;
  comp2: string;
  comp3: string;
  adjustments: string;
  result: {
    arv: number;
    confidence: string;
    averageComp: number;
    perSquareFoot: number;
  } | null;
}

interface AssignmentFeeState {
  contractPrice: string;
  arvValue: string;
  rehabCosts: string;
  buyerMargin: string;
  marketingCosts: string;
  legalCosts: string;
  result: {
    grossProfit: number;
    totalCosts: number;
    netProfit: number;
    roi: string;
    margin: string;
  } | null;
}

interface CashFlowState {
  rentalIncome: string;
  mortgage: string;
  taxes: string;
  insurance: string;
  maintenance: string;
  vacancy: string;
  result: number | null;
}

interface ProfitCalculatorState {
  arv: string;
  rehabCost: string;
  purchasePrice: string;
  assignmentFee: string;
  result: {
    wholesaleProfit: number;
    buyerProfit: number;
    totalDeductions: number;
    percentOfARV: string;
    recommendations: string[];
  } | null;
}

interface RehabEstimatorState {
  squareFeet: string;
  kitchen: string;
  bathroom: string;
  flooring: string;
  paint: string;
  roof: string;
  electrical: string;
  plumbing: string;
  other: string;
  result: {
    breakdown: Record<string, number>;
    subtotal: number;
    contingency: number;
    total: number;
    perSquareFoot: string | null;
  } | null;
}

export function InteractiveCalculators({ searchTerm, selectedCategory }: InteractiveCalculatorsProps) {
  const [arvData, setArvData] = useState<ARVCalculatorState>({
    address: '',
    sqft: '',
    bedrooms: '',
    bathrooms: '',
    comp1: '',
    comp2: '',
    comp3: '',
    adjustments: '',
    result: null,
  });

  const [assignmentData, setAssignmentData] = useState<AssignmentFeeState>({
    contractPrice: '',
    arvValue: '',
    rehabCosts: '',
    buyerMargin: '',
    marketingCosts: '',
    legalCosts: '',
    result: null,
  });

  const [cashFlowData, setCashFlowData] = useState<CashFlowState>({
    rentalIncome: '',
    mortgage: '',
    taxes: '',
    insurance: '',
    maintenance: '',
    vacancy: '',
    result: null,
  });

  const [profitData, setProfitData] = useState<ProfitCalculatorState>({
    arv: '',
    rehabCost: '',
    purchasePrice: '',
    assignmentFee: '',
    result: null,
  });

  const [rehabData, setRehabData] = useState<RehabEstimatorState>({
    squareFeet: '',
    kitchen: '',
    bathroom: '',
    flooring: '',
    paint: '',
    roof: '',
    electrical: '',
    plumbing: '',
    other: '',
    result: null,
  });

  const calculateARV = () => {
    const sqft = parseFloat(arvData.sqft) || 0;
    const bedrooms = parseInt(arvData.bedrooms) || 0;
    const bathrooms = parseInt(arvData.bathrooms) || 0;
    const comp1 = parseFloat(arvData.comp1) || 0;
    const comp2 = parseFloat(arvData.comp2) || 0;
    const comp3 = parseFloat(arvData.comp3) || 0;
    const adjustments = parseFloat(arvData.adjustments) || 0;
    
    // Enhanced ARV calculation based on app.js logic
    const comps = [comp1, comp2, comp3].filter(Boolean);
    const avgComp = comps.length > 0 ? comps.reduce((sum, comp) => sum + comp, 0) / comps.length : 0;
    
    // Base calculation using square footage if no comps
    const baseValue = sqft * 150; // $150 per sq ft base
    const bedroomValue = bedrooms * 10000; // $10k per bedroom
    const bathroomValue = bathrooms * 15000; // $15k per bathroom
    
    const calculatedARV = avgComp > 0 ? avgComp + adjustments : baseValue + bedroomValue + bathroomValue + adjustments;
    
    const confidence = comps.length >= 3 ? 'High' : comps.length >= 2 ? 'Medium' : 'Low';
    
    setArvData(prev => ({ 
      ...prev, 
      result: {
        arv: calculatedARV,
        confidence,
        averageComp: avgComp,
        perSquareFoot: sqft > 0 ? calculatedARV / sqft : 0
      }
    }));
  };

  const calculateAssignmentFee = () => {
    const contractPrice = parseFloat(assignmentData.contractPrice) || 0;
    const arvValue = parseFloat(assignmentData.arvValue) || 0;
    const rehabCosts = parseFloat(assignmentData.rehabCosts) || 0;
    const buyerMargin = parseFloat(assignmentData.buyerMargin) || 0;
    const marketingCosts = parseFloat(assignmentData.marketingCosts) || 0;
    const legalCosts = parseFloat(assignmentData.legalCosts) || 0;
    
    const maxOffer = arvValue - rehabCosts - buyerMargin;
    const grossProfit = maxOffer - contractPrice;
    const totalCosts = marketingCosts + legalCosts;
    const netProfit = grossProfit - totalCosts;
    const roi = totalCosts > 0 ? ((netProfit / totalCosts) * 100).toFixed(2) + '%' : 'N/A';
    const margin = arvValue > 0 ? ((netProfit / arvValue) * 100).toFixed(2) + '%' : 'N/A';
    
    setAssignmentData(prev => ({ 
      ...prev, 
      result: {
        grossProfit,
        totalCosts,
        netProfit,
        roi,
        margin
      }
    }));
  };

  const calculateProfit = () => {
    const arv = parseFloat(profitData.arv) || 0;
    const rehabCost = parseFloat(profitData.rehabCost) || 0;
    const purchasePrice = parseFloat(profitData.purchasePrice) || 0;
    const assignmentFee = parseFloat(profitData.assignmentFee) || 0;
    
    const totalDeductions = rehabCost + assignmentFee;
    const wholesaleProfit = assignmentFee;
    const buyerProfit = arv - purchasePrice - rehabCost - assignmentFee;
    const percentOfARV = arv > 0 ? ((purchasePrice / arv) * 100).toFixed(1) + '%' : 'N/A';
    
    const recommendations = getOfferRecommendations(purchasePrice, arv);
    
    setProfitData(prev => ({ 
      ...prev, 
      result: {
        wholesaleProfit,
        buyerProfit,
        totalDeductions,
        percentOfARV,
        recommendations
      }
    }));
  };

  const calculateRehabCost = () => {
    const squareFeet = parseFloat(rehabData.squareFeet) || 0;
    const categories = {
      kitchen: parseFloat(rehabData.kitchen) || 0,
      bathroom: parseFloat(rehabData.bathroom) || 0,
      flooring: parseFloat(rehabData.flooring) || 0,
      paint: parseFloat(rehabData.paint) || 0,
      roof: parseFloat(rehabData.roof) || 0,
      electrical: parseFloat(rehabData.electrical) || 0,
      plumbing: parseFloat(rehabData.plumbing) || 0,
      other: parseFloat(rehabData.other) || 0
    };

    const subtotal = Object.values(categories).reduce((sum, cost) => sum + cost, 0);
    const contingency = subtotal * 0.1; // 10% contingency
    const total = subtotal + contingency;
    const perSquareFoot = squareFeet > 0 ? (total / squareFeet).toFixed(2) : null;

    setRehabData(prev => ({ 
      ...prev, 
      result: {
        breakdown: categories,
        subtotal,
        contingency,
        total,
        perSquareFoot
      }
    }));
  };

  const getOfferRecommendations = (offer: number, arv: number): string[] => {
    if (arv === 0) return ['Enter ARV to get recommendations'];
    
    const percentage = (offer / arv) * 100;
    
    if (percentage > 75) {
      return ['Offer may be too high', 'Consider reducing desired profit', 'Verify ARV accuracy'];
    } else if (percentage > 65) {
      return ['Competitive offer range', 'Good profit margin', 'Consider market conditions'];
    } else {
      return ['Conservative offer', 'Good profit potential', 'May need to negotiate up'];
    }
  };

  const calculateCashFlow = () => {
    const income = parseFloat(cashFlowData.rentalIncome) || 0;
    const mortgage = parseFloat(cashFlowData.mortgage) || 0;
    const taxes = parseFloat(cashFlowData.taxes) || 0;
    const insurance = parseFloat(cashFlowData.insurance) || 0;
    const maintenance = parseFloat(cashFlowData.maintenance) || 0;
    const vacancy = parseFloat(cashFlowData.vacancy) || 0;
    
    const totalExpenses = mortgage + taxes + insurance + maintenance + vacancy;
    const result = income - totalExpenses;
    setCashFlowData(prev => ({ ...prev, result }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalculateIcon sx={{ mr: 2, color: 'primary.main' }} />
        Interactive Calculators
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Essential calculation tools for wholesaling success
      </Typography>

      <Grid container spacing={4}>
        {/* Enhanced ARV Calculator */}
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HomeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  ARV Calculator
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="Property Address"
                  value={arvData.address}
                  onChange={(e) => setArvData(prev => ({ ...prev, address: e.target.value }))}
                  fullWidth
                  placeholder="123 Main St, City, State"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Square Footage"
                      type="number"
                      value={arvData.sqft}
                      onChange={(e) => setArvData(prev => ({ ...prev, sqft: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Bedrooms"
                      type="number"
                      value={arvData.bedrooms}
                      onChange={(e) => setArvData(prev => ({ ...prev, bedrooms: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Bathrooms"
                      type="number"
                      value={arvData.bathrooms}
                      onChange={(e) => setArvData(prev => ({ ...prev, bathrooms: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Recent Comparable Sales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Comp 1"
                      type="number"
                      value={arvData.comp1}
                      onChange={(e) => setArvData(prev => ({ ...prev, comp1: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Comp 2"
                      type="number"
                      value={arvData.comp2}
                      onChange={(e) => setArvData(prev => ({ ...prev, comp2: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Comp 3"
                      type="number"
                      value={arvData.comp3}
                      onChange={(e) => setArvData(prev => ({ ...prev, comp3: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  label="Adjustments"
                  type="number"
                  value={arvData.adjustments}
                  onChange={(e) => setArvData(prev => ({ ...prev, adjustments: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                  helperText="Positive for upgrades, negative for defects"
                />
              </Box>

              <Button
                variant="contained"
                onClick={calculateARV}
                fullWidth
                sx={{ mb: 3 }}
                disabled={!arvData.address || (!arvData.comp1 && !arvData.sqft)}
              >
                Calculate ARV
              </Button>

              {arvData.result && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    After Repair Value (ARV)
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    {formatCurrency(arvData.result.arv)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Confidence: ${arvData.result.confidence}`}
                      color={arvData.result.confidence === 'High' ? 'success' : arvData.result.confidence === 'Medium' ? 'warning' : 'error'}
                      size="small"
                    />
                    {arvData.result.perSquareFoot > 0 && (
                      <Chip 
                        label={`$${arvData.result.perSquareFoot.toFixed(0)}/sq ft`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                  {arvData.result.averageComp > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Average Comp: {formatCurrency(arvData.result.averageComp)}
                    </Typography>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Assignment Fee Calculator */}
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MoneyIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Assignment Fee Calculator
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="Contract Price"
                  type="number"
                  value={assignmentData.contractPrice}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, contractPrice: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="ARV Value"
                  type="number"
                  value={assignmentData.arvValue}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, arvValue: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Rehab Costs"
                  type="number"
                  value={assignmentData.rehabCosts}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, rehabCosts: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Buyer Margin"
                  type="number"
                  value={assignmentData.buyerMargin}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, buyerMargin: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Marketing Costs"
                      type="number"
                      value={assignmentData.marketingCosts}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, marketingCosts: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Legal Costs"
                      type="number"
                      value={assignmentData.legalCosts}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, legalCosts: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="contained"
                onClick={calculateAssignmentFee}
                fullWidth
                sx={{ mb: 3 }}
                disabled={!assignmentData.contractPrice || !assignmentData.arvValue}
              >
                Calculate Assignment Fee
              </Button>

              {assignmentData.result && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Net Assignment Profit
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={assignmentData.result.netProfit > 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {formatCurrency(assignmentData.result.netProfit)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`ROI: ${assignmentData.result.roi}`}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={`Margin: ${assignmentData.result.margin}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Gross Profit: {formatCurrency(assignmentData.result.grossProfit)} | 
                    Total Costs: {formatCurrency(assignmentData.result.totalCosts)}
                  </Typography>
                  {assignmentData.result.netProfit <= 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      This deal may not be profitable. Consider adjusting terms.
                    </Alert>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profit Calculator */}
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Profit Calculator
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="ARV Value"
                  type="number"
                  value={profitData.arv}
                  onChange={(e) => setProfitData(prev => ({ ...prev, arv: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Purchase Price"
                  type="number"
                  value={profitData.purchasePrice}
                  onChange={(e) => setProfitData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Rehab Costs"
                  type="number"
                  value={profitData.rehabCost}
                  onChange={(e) => setProfitData(prev => ({ ...prev, rehabCost: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Assignment Fee"
                  type="number"
                  value={profitData.assignmentFee}
                  onChange={(e) => setProfitData(prev => ({ ...prev, assignmentFee: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
              </Box>

              <Button
                variant="contained"
                onClick={calculateProfit}
                fullWidth
                sx={{ mb: 3 }}
                disabled={!profitData.purchasePrice || !profitData.arv}
              >
                Calculate Profit
              </Button>

              {profitData.result && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Wholesale Profit Analysis
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={profitData.result.wholesaleProfit > 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {formatCurrency(profitData.result.wholesaleProfit)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${profitData.result.percentOfARV} of ARV`}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={`Buyer Profit: ${formatCurrency(profitData.result.buyerProfit)}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Total Deductions: {formatCurrency(profitData.result.totalDeductions)}
                  </Typography>
                  {profitData.result.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Recommendations:
                      </Typography>
                      {profitData.result.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" color="text.secondary">
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Rehab Cost Estimator */}
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HomeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Rehab Cost Estimator
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="Property Square Footage"
                  type="number"
                  value={rehabData.squareFeet}
                  onChange={(e) => setRehabData(prev => ({ ...prev, squareFeet: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Kitchen Upgrade"
                  type="number"
                  value={rehabData.kitchen}
                  onChange={(e) => setRehabData(prev => ({ ...prev, kitchen: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Bathroom Upgrade"
                  type="number"
                  value={rehabData.bathroom}
                  onChange={(e) => setRehabData(prev => ({ ...prev, bathroom: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Flooring"
                  type="number"
                  value={rehabData.flooring}
                  onChange={(e) => setRehabData(prev => ({ ...prev, flooring: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Paint & Fixtures"
                  type="number"
                  value={rehabData.paint}
                  onChange={(e) => setRehabData(prev => ({ ...prev, paint: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Roof"
                  type="number"
                  value={rehabData.roof}
                  onChange={(e) => setRehabData(prev => ({ ...prev, roof: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Electrical"
                  type="number"
                  value={rehabData.electrical}
                  onChange={(e) => setRehabData(prev => ({ ...prev, electrical: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Plumbing"
                  type="number"
                  value={rehabData.plumbing}
                  onChange={(e) => setRehabData(prev => ({ ...prev, plumbing: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Other Repairs"
                  type="number"
                  value={rehabData.other}
                  onChange={(e) => setRehabData(prev => ({ ...prev, other: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
              </Box>

              <Button
                variant="contained"
                onClick={calculateRehabCost}
                fullWidth
                sx={{ mb: 3 }}
                disabled={!rehabData.squareFeet}
              >
                Calculate Rehab Cost
              </Button>

              {rehabData.result && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Rehab Cost
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    {formatCurrency(rehabData.result.total)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {rehabData.result.perSquareFoot && (
                      <Chip 
                        label={`${rehabData.result.perSquareFoot}/sq ft`}
                        color="primary"
                        size="small"
                      />
                    )}
                    <Chip 
                      label={`${((rehabData.result.contingency / rehabData.result.subtotal) * 100).toFixed(0)}% Contingency`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Subtotal: {formatCurrency(rehabData.result.subtotal)} | 
                    Contingency: {formatCurrency(rehabData.result.contingency)}
                  </Typography>
                  {Object.keys(rehabData.result.breakdown).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Breakdown:
                      </Typography>
                      {Object.entries(rehabData.result.breakdown).map(([key, value]) => (
                        <Typography key={key} variant="body2" color="text.secondary">
                          • {key}: {formatCurrency(value)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Cash Flow Calculator */}
        <Grid item xs={12} lg={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Cash Flow Calculator
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="Monthly Rental Income"
                  type="number"
                  value={cashFlowData.rentalIncome}
                  onChange={(e) => setCashFlowData(prev => ({ ...prev, rentalIncome: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Mortgage Payment"
                  type="number"
                  value={cashFlowData.mortgage}
                  onChange={(e) => setCashFlowData(prev => ({ ...prev, mortgage: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Property Taxes"
                  type="number"
                  value={cashFlowData.taxes}
                  onChange={(e) => setCashFlowData(prev => ({ ...prev, taxes: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Insurance"
                  type="number"
                  value={cashFlowData.insurance}
                  onChange={(e) => setCashFlowData(prev => ({ ...prev, insurance: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Maintenance/Repairs"
                  type="number"
                  value={cashFlowData.maintenance}
                  onChange={(e) => setCashFlowData(prev => ({ ...prev, maintenance: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <TextField
                  label="Vacancy Allowance"
                  type="number"
                  value={cashFlowData.vacancy}
                  onChange={(e) => setCashFlowData(prev => ({ ...prev, vacancy: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
              </Box>

              <Button
                variant="contained"
                onClick={calculateCashFlow}
                fullWidth
                sx={{ mb: 3 }}
                disabled={!cashFlowData.rentalIncome}
              >
                Calculate Cash Flow
              </Button>

              {cashFlowData.result !== null && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Monthly Cash Flow
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={cashFlowData.result > 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {formatCurrency(cashFlowData.result)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Annual: {formatCurrency(cashFlowData.result * 12)}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
