export function campaignToWrikeJson(c: any) {
  return {
    campaign: {
      id: c.id, 
      name: c.name, 
      status: c.status, 
      tags: c.tags || [],
      owners: c.owners || {}, 
      schedule: { startDate: c.startDate, endDate: c.endDate },
      targeting: c.targeting || {}, 
      assets: c.assets || [], 
      notes: c.notes || ""
    },
    tasks: [
      { title: "Creative Brief", owner: c.owners?.creative || "Abby", due: c.startDate },
      { title: "Social Plan", owner: c.owners?.social || "Vanezza", due: c.startDate },
      { title: "Stores Coordination", owner: c.owners?.stores || "Antonio", due: c.startDate },
      { title: "Approvals", owner: c.owners?.approvals || "Theo", due: c.startDate }
    ]
  }
}

export function wrikeTasksToCsv(tasks: {title:string;owner:string;due?:string}[]) {
  const head = "title,owner,due"
  const rows = tasks.map(t => [t.title, t.owner, t.due || ""].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
  return [head, ...rows].join("\n")
}

export function downloadBlob(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}