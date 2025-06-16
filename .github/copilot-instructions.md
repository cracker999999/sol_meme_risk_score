<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Solana Meme Token Risk Score System based on Cloudflare Worker. The system:
- Uses Jupiter Ultra Shield API for token risk assessment
- Implements a weighted scoring model for risk evaluation
- Provides risk levels (Critical/Warning/Info)
- Returns detailed risk analysis through API endpoints

When suggesting code:
- Follow the established risk weight model in the code
- Maintain CORS support for frontend integration
- Keep the API responses consistent with the documented format
- Consider Cloudflare Worker limitations and best practices
- Optimize for performance and reliability
