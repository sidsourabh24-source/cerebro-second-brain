$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$token = (gh auth token)
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 1: Create Project
$createProject = '{"query":"mutation { createProjectV2(input: { ownerId: \"U_kgDODZFXsA\", title: \"CEREBRO \u2014 Build Roadmap\" }) { projectV2 { id number url } } }"}'

$result = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $createProject
$projectId = $result.data.createProjectV2.projectV2.id
$projectUrl = $result.data.createProjectV2.projectV2.url
Write-Host "Project created: $projectUrl" -ForegroundColor Green
Write-Host "Project ID: $projectId" -ForegroundColor Cyan

# Step 2: Get the Status field ID
$getFields = "{`"query`":`"query { node(id: \`"$projectId\`") { ... on ProjectV2 { fields(first: 10) { nodes { ... on ProjectV2SingleSelectField { id name options { id name } } } } } } }`"}"

$fieldsResult = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $getFields
$statusField = $fieldsResult.data.node.fields.nodes | Where-Object { $_.name -eq "Status" }
$statusFieldId = $statusField.id
Write-Host "Status field ID: $statusFieldId" -ForegroundColor Cyan

$statusOptions = $statusField.options
Write-Host "Status options:" -ForegroundColor Yellow
$statusOptions | ForEach-Object { Write-Host "  $($_.name): $($_.id)" }

# Step 3: Get all repo issues
$repoIssues = Invoke-RestMethod -Uri "https://api.github.com/repos/sidsourabh24-source/cerebro-second-brain/issues?state=open&per_page=20" -Headers $headers
Write-Host "`nFound $($repoIssues.Count) issues to add to project" -ForegroundColor Cyan

# Step 4: Add each issue to project
foreach ($issue in $repoIssues) {
    $issueNodeId = $issue.node_id
    $addItem = "{`"query`":`"mutation { addProjectV2ItemById(input: { projectId: \`"$projectId\`", contentId: \`"$issueNodeId\`" }) { item { id } } }`"}"
    
    $addResult = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $addItem
    $itemId = $addResult.data.addProjectV2ItemById.item.id
    Write-Host "  Added issue #$($issue.number): $($issue.title.Substring(0, [Math]::Min(50, $issue.title.Length)))" -ForegroundColor Green
}

Write-Host "`nProject board setup complete!" -ForegroundColor Cyan
Write-Host "Visit: $projectUrl" -ForegroundColor Yellow
