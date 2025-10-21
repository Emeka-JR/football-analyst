import { Component, OnInit, OnDestroy } from '@angular/core';
import Vapi from '@vapi-ai/web';

@Component({
  selector: 'app-football-analyst',
  templateUrl: './football-analyst.component.html',
  styleUrls: ['./football-analyst.component.css']
})
export class FootballAnalystComponent implements OnInit, OnDestroy {
  private vapi: any;
  public isListening = false;
  public isInitialized = false;
  public errorMessage = '';
  public isConnecting = false;

   // System prompt to define the AI's personality as a football analyst
   private readonly systemPrompt = `You are a knowledgeable and friendly football analyst with access to current information up to 2024. You provide accurate, insightful football facts, match analyses, player statistics, and tactical insights. Speak naturally like an experienced sports commentator or pundit. 

Key areas of expertise:
- Current player performances and statistics
- Recent match results and analysis
- Tactical formations and strategies
- Transfer news and rumors
- Historical football moments and records
- League standings and competitions

Always provide up-to-date information when possible. If asked about anything outside football, politely guide the conversation back to football topics while maintaining your friendly, professional demeanor.`;

  ngOnInit(): void {
    this.initializeVapi();
  }

  ngOnDestroy(): void {
    if (this.vapi && this.isListening) {
      this.vapi.stop();
    }
  }

  /**
   * Initialize the Vapi instance
   * Note: You'll need to add your Vapi API key here
   */
  private initializeVapi(): void {
    try {
      // Your Vapi public API key
      const apiKey = 'd680b0dd-6775-4001-b2c0-45247772b3a3';
      
      if (!apiKey || (typeof apiKey === 'string' && apiKey.trim() === '')) {
        this.errorMessage = 'API key is missing or invalid';
        this.isInitialized = false;
        return;
      }

      this.vapi = new Vapi(apiKey);
      
      // Set up event listeners
      this.setupVapiEventListeners();
      
      this.isInitialized = true;
      this.errorMessage = '';
      console.log('Vapi initialized successfully');
    } catch (error) {
      console.error('Error initializing Vapi:', error);
      this.errorMessage = 'Failed to initialize voice assistant. Please check your API key.';
      this.isInitialized = false;
    }
  }

   /**
    * Set up Vapi event listeners
    */
   private setupVapiEventListeners(): void {
     if (!this.vapi) return;

     // Connection established
     this.vapi.on('call-start', () => {
       console.log('✅ Call started - Connection established');
       this.isListening = true;
       this.isConnecting = false;
       this.errorMessage = '';
     });

     // Connection ended
     this.vapi.on('call-end', () => {
       console.log('📞 Call ended');
       this.isListening = false;
       this.isConnecting = false;
     });

     // AI is speaking
     this.vapi.on('speech-start', () => {
       console.log('🎤 AI is speaking');
     });

     // AI finished speaking
     this.vapi.on('speech-end', () => {
       console.log('🔇 AI finished speaking');
     });

     // Connection errors
     this.vapi.on('error', (error: any) => {
       console.error('❌ Vapi error:', error);
       this.errorMessage = 'Voice assistant error: ' + (error.message || 'Unknown error');
       this.isListening = false;
       this.isConnecting = false;
     });

     // Additional connection events for better debugging
     this.vapi.on('call-start-failed', (error: any) => {
       console.error('❌ Call start failed:', error);
       this.errorMessage = 'Failed to start call: ' + (error.message || 'Unknown error');
       this.isConnecting = false;
     });
   }

   /**
    * Start the voice conversation with the football analyst
    */
   startConversation(): void {
     if (!this.isInitialized) {
       this.errorMessage = 'Voice assistant not initialized. Please check your API key.';
       return;
     }

     if (this.isListening) {
       console.log('Already listening');
       return;
     }

     // Check for microphone permissions first
     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
       this.errorMessage = 'Microphone access not supported in this browser.';
       return;
     }

     try {
       this.isConnecting = true;
       this.errorMessage = '';

       const assistantConfig = {
         model: {
           provider: 'openai',
           model: 'gpt-4o-mini', // Updated to more recent model
           messages: [
             {
               role: 'system',
               content: this.systemPrompt,
             },
           ],
         },
         voice: {
           provider: 'playht',
           voiceId: 'jennifer',
         },
       };

       console.log('🚀 Starting conversation with config:', assistantConfig);
       this.vapi.start(assistantConfig);
      
       // Set a timeout to handle connection issues
       setTimeout(() => {
         if (this.isConnecting && !this.isListening) {
           this.errorMessage = 'Connection timeout. Please check your internet connection and try again.';
           this.isConnecting = false;
         }
       }, 15000); // 15 second timeout for better reliability

    } catch (error) {
      console.error('Error starting conversation:', error);
      this.errorMessage = 'Failed to start voice conversation: ' + (error instanceof Error ? error.message : 'Unknown error');
      this.isConnecting = false;
    }
  }

  /**
   * Stop the voice conversation
   */
  stopConversation(): void {
    if (!this.vapi) {
      console.log('Vapi not initialized');
      return;
    }

    try {
      console.log('Stopping conversation');
      this.vapi.stop();
      this.isListening = false;
      this.isConnecting = false;
      this.errorMessage = '';
    } catch (error) {
      console.error('Error stopping conversation:', error);
      this.errorMessage = 'Failed to stop voice conversation: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Toggle between start and stop conversation
   */
  toggleConversation(): void {
    if (this.isListening || this.isConnecting) {
      this.stopConversation();
    } else {
      this.startConversation();
    }
  }
}
