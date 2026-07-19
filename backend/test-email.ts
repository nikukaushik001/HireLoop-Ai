import dotenv from 'dotenv';
dotenv.config();

import { EmailService } from './src/services/email.service';

async function testEmail() {
  console.log('Testing SMTP Configuration...');
  const emailService = new EmailService();

  try {
    // Replace this email with an email address you have access to!
    const targetEmail = 'nikunjkaushik333@gmail.com'; 
    
    console.log(`Sending a test shortlist email to ${targetEmail}...`);
    
    await emailService.sendCandidateShortlistNotification(
      targetEmail,
      'Nikunj Kaushik', // Candidate Name
      'Senior Software Engineer' // Job Title
    );
    
    console.log('✅ SUCCESS! The shortlist email was sent successfully.');
    console.log('Check your inbox (and spam folder just in case).');
  } catch (error) {
    console.error('❌ FAILED! Could not send the email.');
    console.error(error);
  }
}

testEmail();
