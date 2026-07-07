import codecs
import re

with codecs.open('i18n_utf8.js', 'r', 'utf-8') as f:
    text = f.read()

# Fix the broken JSON block first
pattern = re.compile(r'"referralTitle": ".*?\"community\": \{', re.DOTALL)
replacement = '''"referralTitle": "🔗 कानूनी रूप से बाध्यकारी समाधान की आवश्यकता है?",
            "newCase": "🔄 नया केस"
          }
        },
        "policy": {
          "title": "नीति स्पष्टीकरण",
          "subtitle": "किसी भी नीति को सरल भाषा में समझें",
          "placeholder": "एक नीति पाठ चिपकाएं, या एक नीति नाम टाइप करें...",
          "analyzing": "नीति का विश्लेषण हो रहा है...",
          "modes": {
            "simple": "📖 सरल रूप से समझाएं",
            "simplePrompt": "इस नीति को सरल, रोजमर्रा की भाषा में समझाएं",
            "benefits": "👥 किसे लाभ होता है?",
            "benefitsPrompt": "इस बात पर ध्यान दें कि इस नीति से किसे लाभ होता है और कौन नकारात्मक रूप से प्रभावित होता है",
            "prosCons": "⚖️ पक्ष और विपक्ष",
            "prosConsPrompt": "इस नीति के पक्ष और विपक्ष का विस्तृत और संतुलित विश्लेषण दें",
            "eli10": "🧒 ELI10",
            "eli10Prompt": "इस नीति को ऐसे समझाएं जैसे आप 10 साल के बच्चे से बात कर रहे हों"
          }
        },
        "community": {'''

text = pattern.sub(replacement, text)

# Inject newsCategory into English (en-IN)
text = text.replace(
    '"speak": "Speak to Assistant"\n      },',
    '"speak": "Speak to Assistant",\n        "newsCategory": "POLITICS EXPLAINED"\n      },'
)

# Inject newsCategory into Hindi (hi-IN)
text = text.replace(
    '"speak": "सहायक से बात करें"\n      },',
    '"speak": "सहायक से बात करें",\n        "newsCategory": "राजनीति की व्याख्या"\n      },'
)

with codecs.open('./src/i18n.js', 'w', 'utf-8') as f:
    f.write(text)

print('Fixed and Updated i18n.js')
