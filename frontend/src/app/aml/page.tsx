import { useState } from "react"
import { AlertTriangle, Search, Filter, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { amlApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function AmlPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [severityFilter, setSeverityFilter] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['aml-alerts'],
    queryFn: () => amlApi.getAll().then(res => res.data),
  })

  const filteredAlerts = alerts?.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || alert.status === statusFilter
    const matchesSeverity = !severityFilter || alert.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  }) || []

  const handleAcknowledge = async (alertId: string) => {
    try {
      await amlApi.acknowledge(alertId)
      // Refresh alerts
      window.location.reload()
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'ESCALATED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertes AML</h1>
          <p className="text-muted-foreground">
            Détection et gestion des alertes de blanchiment d'argent
          </p>
        </div>
        <Button>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Créer alerte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des alertes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="NEW">Nouveau</option>
                <option value="UNDER_REVIEW">En révision</option>
                <option value="RESOLVED">Résolu</option>
                <option value="ESCALATED">Escaladé</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tous les niveaux</option>
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HIGH">Élevé</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                Aucune alerte trouvée
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(alert.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                      </div>
                      {alert.client && (
                        <div className="text-sm">
                          <span className="font-medium">Client: </span>
                          {alert.client.name}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {alert.status === 'NEW' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAcknowledge(alert.id)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconnaître
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAlert && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Détails de l'alerte</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Informations générales</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Type</span>
                  <div className="font-medium">{selectedAlert.type}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Sévérité</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Score de risque</span>
                  <div className="font-medium">{selectedAlert.riskScore}/100</div>
                </div>
              </div>
            </div>

            {selectedAlert.client && (
              <div>
                <h4 className="font-semibold mb-2">Client concerné</h4>
                <div className="space-y-1">
                  <div>
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <div className="font-medium">{selectedAlert.client.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email</span>
                    <div className="font-medium">{selectedAlert.client.email}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedAlert.matchDetails && (
              <div>
                <h4 className="font-semibold mb-2">Détails du match</h4>
                <div className="space-y-1">
                  <div>
                    <span className="text-sm text-muted-foreground">Source</span>
                    <div className="font-medium">{selectedAlert.matchDetails.source}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Score de match</span>
                    <div className="font-medium">{selectedAlert.matchDetails.matchScore}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Champs correspondants</span>
                    <div className="font-medium">
                      {selectedAlert.matchDetails.matchedFields?.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedAlert.riskFactors && selectedAlert.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Facteurs de risque</h4>
                <div className="space-y-2">
                  {selectedAlert.riskFactors.map((factor, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{factor.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(factor.severity)}`}>
                          {factor.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {factor.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Impact: </span>
                        <span className="font-medium">{factor.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAlert.status === 'RESOLVED' && selectedAlert.resolutionNotes && (
              <div>
                <h4 className="font-semibold mb-2">Résolution</h4>
                <div className="space-y-1">
                  <div>
                    <span className="text-sm text-muted-foreground">Résolu par</span>
                    <div className="font-medium">
                      {selectedAlert.resolvedBy?.firstName} {selectedAlert.resolvedBy?.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date de résolution</span>
                    <div className="font-medium">
                      {new Date(selectedAlert.resolvedAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Notes de résolution</span>
                    <div className="font-medium">{selectedAlert.resolutionNotes}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
