// 🧪 AI Lead Scoring Test Script
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// Test user credentials (you'll need to get a real JWT token)
const TEST_TOKEN = 'your-jwt-token-here';

interface TestContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
}

interface TestTransaction {
  amount: number;
  type: 'sale' | 'purchase' | 'rental' | 'lease';
  status: 'pending' | 'completed' | 'cancelled';
  pipelineStage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  propertyType: string;
  description: string;
}

// Sample test data
const testContacts: TestContact[] = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@tech-company.com',
    phone: '555-0123',
    source: 'website'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@gmail.com',
    phone: '555-0456',
    source: 'referral'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'j.davis@realestate-firm.com',
    phone: '555-0789',
    source: 'cold-call'
  }
];

const testTransactions: TestTransaction[] = [
  {
    amount: 450000,
    type: 'purchase',
    status: 'pending',
    pipelineStage: 'proposal',
    propertyType: 'Single Family Home',
    description: 'Looking for family home in suburban area'
  },
  {
    amount: 850000,
    type: 'sale',
    status: 'completed',
    pipelineStage: 'closed',
    propertyType: 'Luxury Condo',
    description: 'Downtown luxury condo investment'
  },
  {
    amount: 2200,
    type: 'rental',
    status: 'pending',
    pipelineStage: 'qualified',
    propertyType: 'Apartment',
    description: 'Monthly rental for downtown apartment'
  }
];

class AILeadScoringDemo {
  private token: string;
  private axiosInstance: any;

  constructor(token: string) {
    this.token = token;
    this.axiosInstance = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async runDemo() {
    console.log('🤖 AI Lead Scoring Demo Starting...\n');

    try {
      // Step 1: Create test contacts
      console.log('📝 Creating test contacts...');
      const createdContacts = [];
      
      for (const contact of testContacts) {
        try {
          const response = await this.axiosInstance.post('/api/contacts', contact);
          createdContacts.push(response.data.data);
          console.log(`✅ Created contact: ${contact.firstName} ${contact.lastName}`);
        } catch (error) {
          console.error(`❌ Failed to create contact: ${contact.firstName} ${contact.lastName}`);
        }
      }

      // Step 2: Create test transactions for contacts
      console.log('\n💰 Creating test transactions...');
      for (let i = 0; i < createdContacts.length && i < testTransactions.length; i++) {
        const contact = createdContacts[i];
        const transaction = { ...testTransactions[i], contactId: contact.id };
        
        try {
          await this.axiosInstance.post('/api/transactions', transaction);
          console.log(`✅ Created transaction for ${contact.firstName}: $${transaction.amount}`);
        } catch (error) {
          console.error(`❌ Failed to create transaction for ${contact.firstName}`);
        }
      }

      // Step 3: Compute AI lead scores
      console.log('\n🧠 Computing AI lead scores...');
      const leadScores = [];
      
      for (const contact of createdContacts) {
        try {
          const response = await this.axiosInstance.post(`/api/ai/lead-scores/${contact.id}/compute`);
          leadScores.push(response.data.data);
          console.log(`✅ Computed score for ${contact.firstName}: ${response.data.data.score}/100 (${response.data.data.category})`);
        } catch (error) {
          console.error(`❌ Failed to compute score for ${contact.firstName}`);
        }
      }

      // Step 4: Display detailed AI insights
      console.log('\n📊 AI Lead Scoring Results:\n');
      
      for (const score of leadScores) {
        console.log(`\n🎯 Contact: ${score.contact?.firstName} ${score.contact?.lastName}`);
        console.log(`📈 Overall Score: ${score.score}/100`);
        console.log(`🔥 Category: ${score.category.toUpperCase()}`);
        console.log(`🎯 Confidence: ${score.confidence}%`);
        
        console.log('\n📊 Scoring Factors:');
        console.log(`   📋 Demographic: ${score.factors.demographic}/100`);
        console.log(`   🎭 Behavioral: ${score.factors.behavioral}/100`);
        console.log(`   💬 Engagement: ${score.factors.engagement}/100`);
        console.log(`   💰 Financial: ${score.factors.financial}/100`);
        console.log(`   ⏰ Timing: ${score.factors.timing}/100`);
        console.log(`   🎪 Intent: ${score.factors.intent}/100`);
        
        console.log('\n💡 AI Insights:');
        console.log(`   ✅ Strengths: ${score.insights.strengths.join(', ') || 'None identified'}`);
        console.log(`   ⚠️ Weaknesses: ${score.insights.weaknesses.join(', ') || 'None identified'}`);
        console.log(`   🚀 Next Action: ${score.insights.nextBestAction}`);
        console.log(`   📅 Est. Close Time: ${score.insights.estimatedCloseTime} days`);
        console.log(`   💵 Est. Value: $${score.insights.estimatedValue.toLocaleString()}`);
        
        console.log('\n📋 Recommendations:');
        score.insights.recommendations.forEach((rec: string, idx: number) => {
          console.log(`   ${idx + 1}. ${rec}`);
        });
        
        console.log('\n' + '═'.repeat(60));
      }

      // Step 5: Get analytics overview
      console.log('\n📈 Lead Scoring Analytics:');
      try {
        const analyticsResponse = await this.axiosInstance.get('/api/ai/lead-scores/analytics');
        const analytics = analyticsResponse.data.data;
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total Leads: ${analytics.summary.totalLeads}`);
        console.log(`   Average Score: ${analytics.summary.averageScore}/100`);
        console.log(`   Average Confidence: ${analytics.summary.averageConfidence}%`);
        console.log(`   Hot Leads: ${analytics.summary.hotLeads}`);
        
        console.log(`\n🏷️ Category Breakdown:`);
        Object.entries(analytics.categoryBreakdown).forEach(([category, count]) => {
          console.log(`   ${category}: ${count}`);
        });
        
        if (analytics.topPerformers.length > 0) {
          console.log(`\n🏆 Top Performers:`);
          analytics.topPerformers.forEach((performer: any, idx: number) => {
            console.log(`   ${idx + 1}. Score: ${performer.score}/100 - Action: ${performer.nextBestAction}`);
          });
        }
        
      } catch (error) {
        console.error('❌ Failed to get analytics');
      }

      console.log('\n🎉 AI Lead Scoring Demo Complete!');
      console.log('\n🔗 API Documentation: http://localhost:3001/api-docs');
      console.log('🔗 Try the AI endpoints in the Swagger UI!');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Instructions for running the demo
console.log(`
🤖 AI Lead Scoring Demo Instructions:

1. First, get a JWT token by logging in:
   POST http://localhost:3001/auth/login
   Body: { "email": "your@email.com", "password": "yourpassword" }

2. Replace TEST_TOKEN with your actual JWT token above

3. Run this script:
   npx tsx test-ai-scoring.ts

4. Check the API documentation:
   http://localhost:3001/api-docs

5. Explore the AI Lead Scoring endpoints:
   - GET /api/ai/lead-scores - List all scores
   - GET /api/ai/lead-scores/analytics - Get insights
   - POST /api/ai/lead-scores/{contactId}/compute - Compute score
   - GET /api/ai/recommendations/{contactId} - Get AI recommendations

🎯 The AI system analyzes multiple factors:
   📋 Demographics (email domain, contact info completeness)
   🎭 Behavioral (transaction frequency, recent activity)
   💬 Engagement (multiple touchpoints, responsiveness)
   💰 Financial (transaction values, deal size)
   ⏰ Timing (lead age, pipeline progression)
   🎪 Intent (pipeline stage, engagement level)

🔮 AI Insights include:
   - Strengths and weaknesses analysis
   - Personalized recommendations
   - Next best action suggestions
   - Estimated close time and value
   - Confidence scoring

Ready to see AI-powered lead scoring in action! 🚀
`);

// Uncomment the following lines and add your JWT token to run the demo:
// const demo = new AILeadScoringDemo(TEST_TOKEN);
// demo.runDemo();
