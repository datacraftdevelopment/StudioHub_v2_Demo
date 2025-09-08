# Adding New FileMaker Databases to MCP Server

## How to Add StudioHub Database (or any new FM file)

### 1. Update Environment Variables

Edit `/mcp-server/.env` and add the new database credentials:

```env
# StudioHub Database
FM_DATABASE_STUDIOHUB=StudioHub
FM_ACCOUNT_STUDIOHUB=your_account_name
FM_PASSWORD_STUDIOHUB=your_password
```

**Replace with actual values:**
- `StudioHub` - actual FileMaker filename
- `your_account_name` - account with Data API access
- `your_password` - account password

### 2. Update Database Enum in MCP Server

The MCP server is already configured to handle multiple databases. It will automatically recognize:
- `TC-AI` - Uses FM_ACCOUNT_TCAI/FM_PASSWORD_TCAI
- `StudioHub` - Uses FM_ACCOUNT_STUDIOHUB/FM_PASSWORD_STUDIOHUB

### 3. Required FileMaker Setup for New Database

For each new FileMaker database, ensure:

#### Data API Access Enabled:
1. Open FileMaker Pro
2. File → Sharing → Configure for FileMaker Data API
3. Enable "FileMaker Data API access via HTTPS"

#### Account with Proper Privileges:
1. Create or modify an account for API access
2. Assign privilege set with:
   - **Data Access and Design:** `View only` (for read-only web dashboard)
   - **Extended Privileges:** Check `Access via FileMaker Data API [fmrest]`

#### Layouts Accessible via Data API:
1. For each layout you want to access via API:
   - Layout Setup → General tab
   - Check "Include in layouts menu"
   - Ensure fields are accessible (not restricted)

### 4. Test New Database Connection

After adding credentials, test the connection:

```bash
# In the mcp-server directory
npm start
```

Then in Claude, test:
- "List layouts in StudioHub database"
- "Get metadata for [layout_name] in StudioHub database"

### 5. Common Issues & Solutions

#### Database Not Found Error:
- Check FM_DATABASE_STUDIOHUB matches actual filename
- Verify database is hosted on the server
- Confirm database is open in FileMaker Server

#### Authentication Failed:
- Verify account exists in the FileMaker database
- Check account has fmrest extended privilege
- Confirm password is correct

#### Layout Access Issues:
- Ensure layouts are not restricted by privilege set
- Check layout has "Include in layouts menu" enabled
- Verify fields on layout are accessible

#### No Records Returned:
- Check account has record access privileges
- Verify there are records in the table
- Check for record-level access restrictions

### 6. Adding More Databases

To add additional databases beyond TC-AI and StudioHub:

1. **Add environment variables:**
   ```env
   FM_DATABASE_NEWDB=NewDatabaseName
   FM_ACCOUNT_NEWDB=account_name
   FM_PASSWORD_NEWDB=password
   ```

2. **Update MCP server getDatabaseConfig method:**
   ```javascript
   getDatabaseConfig(database) {
     const configs = {
       'TC-AI': { ... },
       'StudioHub': { ... },
       'NewDB': {
         database: process.env.FM_DATABASE_NEWDB,
         username: process.env.FM_ACCOUNT_NEWDB,
         password: process.env.FM_PASSWORD_NEWDB
       }
     };
   }
   ```

3. **Update tool inputSchema enum:**
   ```javascript
   enum: ['TC-AI', 'StudioHub', 'NewDB']
   ```

### 7. Security Best Practices

- Use dedicated accounts for API access (not admin accounts)
- Grant minimum required privileges
- Consider read-only access for dashboard applications
- Use strong passwords for API accounts
- Regularly rotate API account passwords

### 8. Next Steps for StudioHub Integration

Once StudioHub database is added:
1. List all available layouts
2. Analyze layout structure (Projects, Studio Requests, Deliverables)
3. Document field names and relationships
4. Test record access and data permissions
5. Complete discovery phase documentation
