# Guide de Contribution

Merci de votre intérêt pour contribuer à la plateforme RegTech ! Ce guide vous aidera à démarrer.

## 📋 Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)

## 🤝 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite:

- Être respectueux et inclusif
- Fournir des retours constructifs
- Accepter les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Montrer de l'empathie envers les autres contributeurs

## 🚀 Comment Contribuer

### Signaler des Bugs

1. Vérifiez si le bug n'a pas déjà été signalé
2. Créez une nouvelle issue avec:
   - Un titre descriptif
   - La version du projet
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs observé
   - Des captures d'écran si pertinent

### Proposer des Nouvelles Fonctionnalités

1. Vérifiez si la fonctionnalité n'a pas déjà été proposée
2. Créez une nouvelle issue avec:
   - Un titre descriptif
   - Une description détaillée de la fonctionnalité
   - Les cas d'utilisation
   - Les avantages potentiels

### Soumettre du Code

1. Fork le repository
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 🔄 Processus de Développement

### Branches

- `main`: Branche principale stable
- `develop`: Branche de développement
- `feature/*`: Nouvelles fonctionnalités
- `bugfix/*`: Corrections de bugs
- `hotfix/*`: Corrections critiques en production

### Workflow

1. Créez une branche depuis `develop`
2. Développez et testez vos changements
3. Assurez-vous que les tests passent
4. Soumettez une Pull Request vers `develop`
5. Attendez la review et l'approbation
6. Les mainteneurs fusionneront dans `develop`
7. Les changements seront fusionnés dans `main` lors de releases

## 📝 Standards de Code

### Backend (NestJS)

```typescript
// Utiliser des interfaces pour les DTOs
interface CreateUserDto {
  email: string;
  password: string;
}

// Utiliser des classes pour les services
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: dto });
  }
}

// Utiliser des guards pour l'authentification
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Frontend (Next.js)

```typescript
// Utiliser des composants fonctionnels avec hooks
export default function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery(['user', userId], () => fetchUser(userId));

  return <div>{user?.name}</div>;
}

// Utiliser TypeScript strict
interface Props {
  title: string;
  onClick: () => void;
}

export function Button({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}
```

### Python (FastAPI)

```python
# Utiliser des Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Utiliser des services
class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: UserCreate) -> User:
        return User(**user.dict())
```

## 📦 Commit Convention

Nous utilisons les Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, style
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

### Exemples

```
feat(auth): add JWT authentication

fix(users): resolve issue with user creation

docs(readme): update installation instructions

test(kyc): add unit tests for KYC service
```

## 🔍 Pull Request Process

### Avant de soumettre

1. Assurez-vous que les tests passent
2. Mettez à jour la documentation si nécessaire
3. Ajoutez des tests pour les nouvelles fonctionnalités
4. Suivez les standards de code

### Titre de la PR

Utilisez le format: `[Type] Description`

Exemples:
- `[Feature] Add JWT authentication`
- `[Bugfix] Fix user creation issue`
- `[Docs] Update deployment guide`

### Description de la PR

Incluez:
- Description des changements
- Motivation du changement
- Tests ajoutés/modifiés
- Documentation mise à jour
- Screenshots si applicable

### Review Process

1. Au moins une approbation requise
2. Tous les tests doivent passer
3. Pas de conflits avec la branche cible
4. Code review complet

### Fusion

Les PRs sont fusionnées avec:
- Squash and merge pour les petites corrections
- Merge commit pour les fonctionnalités importantes

## 📚 Ressources

- [Guide de Style TypeScript](https://typescript-eslint.io/rules/)
- [Guide de Style Python](https://peps8.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)

## 💬 Questions ?

N'hésitez pas à ouvrir une issue pour toute question ou suggestion !

---

Merci de contribuer à la plateforme RegTech ! 🎉
