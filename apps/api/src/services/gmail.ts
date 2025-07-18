// 📧 Gmail API Integration Service
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface GmailUser {
  googleAccessToken: string;
  googleRefreshToken?: string;
  email: string;
}

export class GmailService {
  private oauth2Client: OAuth2Client;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  // Set user credentials
  setCredentials(user: GmailUser) {
    this.oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });
  }

  // Send an email
  async sendEmail(user: GmailUser, message: EmailMessage): Promise<any> {
    this.setCredentials(user);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const emailContent = [
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
      `Content-Type: ${message.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
      '',
      message.body
    ].join('\n');

    const encodedMessage = Buffer.from(emailContent).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      
      return result.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Fetch inbox messages
  async getInboxMessages(user: GmailUser, maxResults: number = 10): Promise<any> {
    this.setCredentials(user);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        maxResults: maxResults,
      });

      const messages = response.data.messages || [];
      const detailedMessages = [];

      for (const message of messages.slice(0, 5)) { // Limit to 5 for demo
        if (message.id) {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          });
          detailedMessages.push(details.data);
        }
      }

      return detailedMessages;
    } catch (error) {
      console.error('Error fetching inbox:', error);
      throw error;
    }
  }

  // Search emails
  async searchEmails(user: GmailUser, query: string, maxResults: number = 10): Promise<any> {
    this.setCredentials(user);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      });

      return response.data.messages || [];
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(user: GmailUser): Promise<any> {
    this.setCredentials(user);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    try {
      const response = await gmail.users.getProfile({
        userId: 'me',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

// Real Estate Email Templates
export const EmailTemplates = {
  welcome: (clientName: string, agentName: string) => ({
    subject: `Welcome to Our Real Estate Services, ${clientName}!`,
    body: `
      <h2>Welcome ${clientName}!</h2>
      <p>Thank you for choosing our real estate services. I'm ${agentName}, and I'm excited to help you with your property needs.</p>
      
      <h3>What's Next?</h3>
      <ul>
        <li>I'll be in touch within 24 hours to discuss your requirements</li>
        <li>We'll schedule a consultation at your convenience</li>
        <li>I'll provide you with market insights and property recommendations</li>
      </ul>
      
      <p>Feel free to reply to this email or call me anytime if you have questions.</p>
      
      <p>Best regards,<br/>
      ${agentName}<br/>
      Open House CRM</p>
    `,
    isHtml: true
  }),

  propertyAlert: (clientName: string, propertyAddress: string, price: string, agentName: string) => ({
    subject: `New Property Alert: ${propertyAddress}`,
    body: `
      <h2>New Property Match Found!</h2>
      <p>Hi ${clientName},</p>
      
      <p>I found a property that matches your criteria:</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3>${propertyAddress}</h3>
        <p><strong>Price:</strong> ${price}</p>
        <p>This property just came on the market and fits your requirements perfectly.</p>
      </div>
      
      <p>Would you like to schedule a viewing? I can arrange it as early as tomorrow.</p>
      
      <p>Best regards,<br/>
      ${agentName}<br/>
      Open House CRM</p>
    `,
    isHtml: true
  }),

  followUp: (clientName: string, agentName: string, lastInteraction: string) => ({
    subject: `Following Up on Your Real Estate Search`,
    body: `
      <h2>How's Your Property Search Going?</h2>
      <p>Hi ${clientName},</p>
      
      <p>I wanted to follow up on our ${lastInteraction}. Have you had a chance to think about the properties we discussed?</p>
      
      <h3>I'm Here to Help:</h3>
      <ul>
        <li>Answer any questions about the properties</li>
        <li>Schedule additional viewings</li>
        <li>Provide market analysis and pricing insights</li>
        <li>Connect you with trusted mortgage professionals</li>
      </ul>
      
      <p>The market is moving quickly, so don't hesitate to reach out if you'd like to move forward with any properties.</p>
      
      <p>Best regards,<br/>
      ${agentName}<br/>
      Open House CRM</p>
    `,
    isHtml: true
  }),

  marketUpdate: (clientName: string, agentName: string, marketStats: string) => ({
    subject: `Monthly Market Update - Important Trends`,
    body: `
      <h2>Your Monthly Market Update</h2>
      <p>Hi ${clientName},</p>
      
      <p>Here's what's happening in your local real estate market this month:</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3>Market Highlights:</h3>
        <p>${marketStats}</p>
      </div>
      
      <h3>What This Means for You:</h3>
      <ul>
        <li>Property values continue to show strength</li>
        <li>Inventory remains competitive</li>
        <li>Great financing options are still available</li>
      </ul>
      
      <p>If you're ready to make a move, now is a great time to start seriously looking.</p>
      
      <p>Best regards,<br/>
      ${agentName}<br/>
      Open House CRM</p>
    `,
    isHtml: true
  })
};
