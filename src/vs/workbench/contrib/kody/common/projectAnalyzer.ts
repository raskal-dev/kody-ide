import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { URI } from '../../../../base/common/uri.js';
import { ProjectAnalysis, FileStructure } from './types.js';

export class ProjectAnalyzer {
  private workspaceRoot: URI | undefined;

  constructor(
    private readonly workspaceService: IWorkspaceContextService,
    private readonly fileService: IFileService
  ) {
    const workspaceFolders = this.workspaceService.getWorkspace().folders;
    this.workspaceRoot = workspaceFolders[0]?.uri;
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

    const walkDir = async (dir: URI, isRoot: boolean = false): Promise<void> => {
      try {
        const stat = await this.fileService.resolve(dir);
        
        if (!stat.children) {
          return;
        }

        for (const child of stat.children) {
          // Calculer le chemin relatif manuellement
          const workspacePath = this.workspaceRoot!.fsPath;
          const childPath = child.resource.fsPath;
          const relativePath = childPath.startsWith(workspacePath)
            ? childPath.substring(workspacePath.length + 1) // +1 pour le séparateur
            : childPath;

          // Ignorer les patterns
          if (ignorePatterns.some(pattern => relativePath.includes(pattern))) {
            continue;
          }

          if (child.isDirectory) {
            directories.push(relativePath);
            await walkDir(child.resource, false);
          } else {
            files.push(relativePath);
            if (isRoot) {
              rootFiles.push(child.name);
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
      const lastDot = file.lastIndexOf('.');
      const ext = lastDot >= 0 ? file.substring(lastDot).toLowerCase() : '';
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
    const packageJsonUri = URI.joinPath(this.workspaceRoot, 'package.json');
    if (await this.fileService.exists(packageJsonUri)) {
      try {
        const content = await this.fileService.readFile(packageJsonUri);
        const packageJson = JSON.parse(content.value.toString());
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
    const requirementsUri = URI.joinPath(this.workspaceRoot, 'requirements.txt');
    const pyprojectUri = URI.joinPath(this.workspaceRoot, 'pyproject.toml');
    
    if (await this.fileService.exists(requirementsUri) || await this.fileService.exists(pyprojectUri)) {
      try {
        const contentUri = await this.fileService.exists(requirementsUri) ? requirementsUri : pyprojectUri;
        const content = await this.fileService.readFile(contentUri);
        const contentStr = content.value.toString();
        
        if (contentStr.includes('fastapi')) frameworks.push('FastAPI');
        if (contentStr.includes('flask')) frameworks.push('Flask');
        if (contentStr.includes('django')) frameworks.push('Django');
        if (contentStr.includes('pytest')) frameworks.push('pytest');
      } catch (error) {
        // Ignorer les erreurs
      }
    }

    // Vérifier Cargo.toml pour Rust
    const cargoUri = URI.joinPath(this.workspaceRoot, 'Cargo.toml');
    if (await this.fileService.exists(cargoUri)) {
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
    const packageJsonUri = URI.joinPath(this.workspaceRoot, 'package.json');
    if (await this.fileService.exists(packageJsonUri)) {
      try {
        const content = await this.fileService.readFile(packageJsonUri);
        const packageJson = JSON.parse(content.value.toString());
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
      const fileUri = this.workspaceRoot
        ? URI.joinPath(this.workspaceRoot, filePath)
        : URI.file(filePath);
      
      if (await this.fileService.exists(fileUri)) {
        const content = await this.fileService.readFile(fileUri);
        return content.value.toString();
      }
    } catch (error) {
      // Ignorer les erreurs
    }
    return null;
  }
}

