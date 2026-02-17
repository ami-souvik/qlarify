
import { PROMPTS, SHARED_COMMON } from './prompts';

export class PromptManager {
  private prompts: Record<string, string>;
  private shared: Record<string, string>;

  constructor() {
    this.prompts = PROMPTS;
    this.shared = {
        'shared/_common': SHARED_COMMON,
        // Map other shared files if needed
        'shared/_common.txt': SHARED_COMMON // Handle .txt extension in include
    };
  }

  /**
   * Loads a prompt file, resolving @include() directives and replacing {{VARIABLES}}.
   */
  public async loadPrompt(key: string, variables: Record<string, string> = {}): Promise<string> {
    // Remove .txt extension if present for key lookup
    const lookupKey = key.replace('.txt', '');
    
    let content = this.prompts[lookupKey];
    if (!content) {
        throw new Error(`Prompt not found: ${key}`);
    }
    
    // 1. Resolve Includes
    content = this.resolveIncludes(content);

    // 2. Interpolate Variables
    content = this.interpolateVariables(content, variables);

    return content;
  }

  private resolveIncludes(content: string): string {
    const includeRegex = /@include\(([^)]+)\)/g;
    let match;
    let newContent = content;

    // Simple replacement for known shared snippets
    while ((match = includeRegex.exec(newContent)) !== null) {
        const fullMatch = match[0];
        const includeKey = match[1];
        
        const sharedContent = this.shared[includeKey] || this.shared[includeKey.replace('.txt', '')];
        
        if (sharedContent) {
             newContent = newContent.replace(fullMatch, sharedContent);
             // Reset regex to handle potential recursive includes (if we supported them fully)
             includeRegex.lastIndex = 0; 
        } else {
             console.warn(`Include not found: ${includeKey}`);
             newContent = newContent.replace(fullMatch, `[MISSING INCLUDE: ${includeKey}]`);
        }
    }
    
    return newContent;
  }

  private interpolateVariables(content: string, variables: Record<string, string>): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        const key = variableName.trim();
        if (key in variables) {
            return variables[key];
        }
        console.warn(`Variable {{${key}}} not found in context.`);
        return `[MISSING: ${key}]`;
    });
  }
}
