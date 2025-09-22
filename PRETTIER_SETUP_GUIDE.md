# 🎨 Prettier Setup Guide - Format on Save

## ⚠️ **Issue: Prettier Not Running on Save**

If Prettier isn't formatting your code when you save files, follow these steps:

---

## 🔧 **Step 1: Install Prettier VS Code Extension**

1. **Open VS Code**
2. **Go to Extensions** (Ctrl+Shift+X)
3. **Search for**: `Prettier - Code formatter`
4. **Install**: The official Prettier extension by `esbenp.prettier-vscode`

---

## ⚙️ **Step 2: Verify VS Code Settings**

Your `.vscode/settings.json` is already configured with:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

---

## 🔍 **Step 3: Troubleshooting**

### **Check 1: Prettier Extension Status**
1. Open any `.tsx` or `.ts` file
2. Right-click → **Format Document**
3. If prompted, select **Prettier** as the formatter

### **Check 2: Command Palette Test**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Format Document`
3. Select: `Format Document With... → Prettier`

### **Check 3: Status Bar**
- Look at the bottom-right of VS Code
- Should show `Prettier` when editing supported files
- If it shows a different formatter, click it and select Prettier

### **Check 4: Manual Test**
Try formatting manually:
```bash
npm run format:src
```

---

## 🛠️ **Alternative Solutions**

### **Option 1: Global VS Code Settings**
If project settings don't work, add to your global VS Code settings:

1. **Open**: `Ctrl+Shift+P` → `Preferences: Open Settings (JSON)`
2. **Add**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.requireConfig": false
}
```

### **Option 2: File-specific Formatting**
Right-click any file → **Format Document** to test manually

### **Option 3: Keyboard Shortcut**
- **Windows/Linux**: `Shift+Alt+F`
- **Mac**: `Shift+Option+F`

---

## ✅ **Verification Steps**

### **Test Format on Save:**
1. **Open**: `src/components/Navbar.tsx`
2. **Add** some extra spaces or line breaks
3. **Save** the file (`Ctrl+S`)
4. **Check**: Spaces should be automatically cleaned up

### **Expected Behavior:**
- ✅ Code automatically formats when you save
- ✅ Consistent indentation and spacing
- ✅ Single quotes instead of double quotes
- ✅ No unnecessary semicolons
- ✅ Proper line breaks and spacing

---

## 🎯 **Manual Commands (Backup)**

If VS Code integration doesn't work, use these commands:

```bash
# Format all source files
npm run format:src

# Format specific file
npx prettier --write src/components/Navbar.tsx

# Check if file needs formatting
npx prettier --check src/components/Navbar.tsx

# Format and show diff
npx prettier --write --list-different src/components/Navbar.tsx
```

---

## 🔧 **Common Issues & Solutions**

### **Issue**: "Prettier not found"
**Solution**: Restart VS Code after installing the extension

### **Issue**: "Multiple formatters available"
**Solution**: Set Prettier as default in settings

### **Issue**: "Format on save not working"
**Solution**: Check if `editor.formatOnSave` is enabled in settings

### **Issue**: "Wrong formatting applied"
**Solution**: Verify `.prettierrc` configuration is correct

---

## ✅ **Success Indicators**

When working correctly, you should see:
- ✅ **Status Bar**: Shows "Prettier" when editing files
- ✅ **Auto Format**: Code formats immediately on save
- ✅ **Consistent Style**: All files follow same formatting rules
- ✅ **No Manual Work**: Formatting happens automatically

**Follow these steps and Prettier should work perfectly with format on save!** 🎨✨
