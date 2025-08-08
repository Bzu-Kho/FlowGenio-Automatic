# 📝 FlowForge Git Workflow Guide

## 🌟 Branching Strategy

```
master (main)     ←── Production ready code
│
├── develop       ←── Integration branch
│   │
│   ├── feature/nodes      ←── Node development
│   ├── feature/frontend   ←── Frontend features
│   ├── feature/backend    ←── Backend features
│   └── feature/ai         ←── AI integration
│
└── hotfix/*      ←── Critical fixes
```

## 🚀 Common Git Commands for FlowForge

### Daily Development

```bash
# Switch to develop branch
git checkout develop

# Create new feature branch
git checkout -b feature/new-node-type

# Add changes
git add .
git commit -m "✨ Add new HTTP Request node"

# Push to remote
git push origin feature/new-node-type
```

### Commit Message Conventions

```
🚀 feat: New feature
🐛 fix: Bug fix
📝 docs: Documentation
🎨 style: Code style changes
♻️  refactor: Code refactoring
⚡ perf: Performance improvements
✅ test: Testing
🔧 chore: Maintenance
```

### Example Commits

```bash
git commit -m "🚀 feat: Add WebSocket real-time execution"
git commit -m "🐛 fix: Node connection validation error"
git commit -m "📝 docs: Update API documentation"
git commit -m "🎨 style: Improve node palette UI"
```

## 🔄 Workflow Steps

1. **Start new feature**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Work on feature**

   ```bash
   # Make changes
   git add .
   git commit -m "🚀 feat: Add amazing feature"
   ```

3. **Merge back to develop**

   ```bash
   git checkout develop
   git merge feature/my-feature
   git push origin develop
   ```

4. **Deploy to production**
   ```bash
   git checkout master
   git merge develop
   git push origin master
   ```
