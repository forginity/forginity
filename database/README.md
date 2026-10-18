```bash


forginity/
├── apps/
│   ├── shell/
│   ├── auth/
│   ├── admin/
│   └── project-1/                  # PikyRider frontend
│
├── services/
│   ├── platform-api/               # Forginity platform metadata
│   ├── auth/                       # Identity and SSO
│   ├── payment-api/
│   ├── notification-api/
│   └── pikyrider-api/
│
├── packages/
│   ├── ui/
│   ├── sdk/
│   ├── types/
│   └── validation/
│
├── database/
│   ├── README.md
│   │
│   ├── infrastructure/
│   │   ├── docker-compose.yml
│   │   ├── init/
│   │   │   └── 01-create-databases.sh
│   │   └── scripts/
│   │       ├── backup.sh
│   │       └── restore.sh
│   │
│   ├── platform/
│   │   ├── drizzle.config.ts
│   │   ├── schema/
│   │   │   ├── products.ts
│   │   │   ├── product-features.ts
│   │   │   └── product-versions.ts
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── auth/
│   │   ├── drizzle.config.ts
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── sessions.ts
│   │   │   ├── organizations.ts
│   │   │   └── memberships.ts
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── payments/
│   │   ├── drizzle.config.ts
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   └── products/
│       └── pikyrider/
│           ├── drizzle.config.ts
│           ├── schema/
│           ├── migrations/
│           └── seed.ts
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── compose/
│
├── docs/
│   └── org/
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json

```
