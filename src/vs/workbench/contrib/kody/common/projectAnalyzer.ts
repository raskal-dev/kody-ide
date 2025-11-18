import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalysis, FileStructure } from './types.js';

export class ProjectAnalyzer {
  private workspaceRoot: string | undefined;

  constructor(
    private readonly workspaceService: IWorkspaceContextService
  ) {
    const workspaceFolders = this.workspaceService.getWorkspace().folders;
    this.workspaceRoot = workspaceFolders[0]?.uri.fsPath;
  }

  /**
   * Analyse complète du projet
   */
  public async analyzeProject(): Promise<ProjectAnalysis> {
    if (!this.workspaceRoot) {
      throw new Error('Aucun workspace ouvert');
    }

    const structure = await this.analyzeStructure();
    const languages = await this.detectLanguages();
    const frameworks = await this.detectFrameworks();
    const dependencies = await this.detectDependencies();

    const summary = this.generateSummary(structure, languages, frameworks, dependencies);

    return {
      structure,
      languages,
      frameworks,
      dependencies,
      summary,
    };
  }

  /**
   * Analyse la structure des fichiers
   */
  private async analyzeStructure(): Promise<FileStructure> {
    if (!this.workspaceRoot) {
      return { files: [], directories: [], rootFiles: [] };
    }

    const files: string[] = [];
    const directories: string[] = [];
    const rootFiles: string[] = [];

    const ignorePatterns = [
      'node_modules',
      '.git',
      '.vscode',
      'dist',
      'build',
      '__pycache__',
      '.venv',
      'venv',
      '.env',
    ];

    const walkDir = async (dir: string, isRoot: boolean = false): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(this.workspaceRoot!, fullPath);

          // Ignorer les patterns
          if (ignorePatterns.some(pattern => relativePath.includes(pattern))) {
            continue;
          }

          if (entry.isDirectory()) {
            directories.push(relativePath);
            await walkDir(fullPath, false);
          } else {
            files.push(relativePath);
            if (isRoot) {
              rootFiles.push(entry.name);
            }
          }
        }
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    };

    await walkDir(this.workspaceRoot, true);

    return { files, directories, rootFiles };
  }

  /**
   * Détecte les langages utilisés
   */
  private async detectLanguages(): Promise<string[]> {
    if (!this.workspaceRoot) {
      return [];
    }

    const languages = new Set<string>();
    const extensions = new Map<string, string>([
      ['.ts', 'TypeScript'],
      ['.tsx', 'TypeScript'],
      ['.js', 'JavaScript'],
      ['.jsx', 'JavaScript'],
      ['.py', 'Python'],
      ['.java', 'Java'],
      ['.cpp', 'C++'],
      ['.c', 'C'],
      ['.cs', 'C#'],
      ['.go', 'Go'],
      ['.rs', 'Rust'],
      ['.php', 'PHP'],
      ['.rb', 'Ruby'],
      ['.swift', 'Swift'],
      ['.kt', 'Kotlin'],
      ['.dart', 'Dart'],
      ['.html', 'HTML'],
      ['.css', 'CSS'],
      ['.scss', 'SCSS'],
      ['.json', 'JSON'],
      ['.yaml', 'YAML'],
      ['.yml', 'YAML'],
      ['.xml', 'XML'],
      ['.sql', 'SQL'],
      ['.sh', 'Shell'],
      ['.dockerfile', 'Dockerfile'],
      ['.md', 'Markdown'],
    ]);

    const structure = await this.analyzeStructure();
    for (const file of structure.files) {
      const ext = path.extname(file).toLowerCase();
      const lang = extensions.get(ext);
      if (lang) {
        languages.add(lang);
      }
    }

    return Array.from(languages).sort();
  }

  /**
   * Détecte les frameworks utilisés
   */
  private async detectFrameworks(): Promise<string[]> {
    if (!this.workspaceRoot) {
      return [];
    }

    const frameworks: string[] = [];

    // Vérifier package.json pour Node.js
    const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.react) frameworks.push('React');
        if (deps.vue) frameworks.push('Vue.js');
        if (deps.angular) frameworks.push('Angular');
        if (deps.next) frameworks.push('Next.js');
        if (deps['@nestjs/core']) frameworks.push('NestJS');
        if (deps.express) frameworks.push('Express');
        if (deps.fastify) frameworks.push('Fastify');
      } catch (error) {
        // Ignorer les erreurs
      }
    }

    // Vérifier requirements.txt ou pyproject.toml pour Python
    const requirementsPath = path.join(this.workspaceRoot, 'requirements.txt');
    const pyprojectPath = path.join(this.workspaceRoot, 'pyproject.toml');
    
    if (fs.existsSync(requirementsPath) || fs.existsSync(pyprojectPath)) {
      try {
        const content = fs.existsSync(requirementsPath)
          ? fs.readFileSync(requirementsPath, 'utf-8')
          : fs.readFileSync(pyprojectPath, 'utf-8');
        
        if (content.includes('fastapi')) frameworks.push('FastAPI');
        if (content.includes('flask')) frameworks.push('Flask');
        if (content.includes('django')) frameworks.push('Django');
        if (content.includes('pytest')) frameworks.push('pytest');
      } catch (error) {
        // Ignorer les erreurs
      }
    }

    // Vérifier Cargo.toml pour Rust
    const cargoPath = path.join(this.workspaceRoot, 'Cargo.toml');
    if (fs.existsSync(cargoPath)) {
      frameworks.push('Rust/Cargo');
    }

    return frameworks;
  }

  /**
   * Détecte les dépendances principales
   */
  private async detectDependencies(): Promise<string[]> {
    if (!this.workspaceRoot) {
      return [];
    }

    const dependencies: string[] = [];

    // Package.json
    const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        dependencies.push(...Object.keys(deps).slice(0, 10)); // Top 10
      } catch (error) {
        // Ignorer
      }
    }

    return dependencies;
  }

  /**
   * Génère un résumé du projet
   */
  private generateSummary(
    structure: FileStructure,
    languages: string[],
    frameworks: string[],
    dependencies: string[]
  ): string {
    const parts: string[] = [];

    parts.push(`Projet avec ${structure.files.length} fichiers et ${structure.directories.length} dossiers.`);

    if (languages.length > 0) {
      parts.push(`Langages: ${languages.join(', ')}.`);
    }

    if (frameworks.length > 0) {
      parts.push(`Frameworks: ${frameworks.join(', ')}.`);
    }

    if (dependencies.length > 0) {
      parts.push(`Dépendances principales: ${dependencies.slice(0, 5).join(', ')}.`);
    }

    return parts.join(' ');
  }

  /**
   * Récupère le contenu d'un fichier pour l'analyse
   */
  public async getFileContent(filePath: string): Promise<string | null> {
    try {
      const fullPath = this.workspaceRoot
        ? path.join(this.workspaceRoot, filePath)
        : filePath;
      
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf-8');
      }
    } catch (error) {
      // Ignorer les erreurs
    }
    return null;
  }
}

