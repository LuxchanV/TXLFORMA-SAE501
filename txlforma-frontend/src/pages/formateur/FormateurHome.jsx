import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import FormateurLayout from "./FormateurLayout.jsx";
import {
  mesSessionsFormateur,
  participantsSession,
  marquerPresence,
  enregistrerEvaluation,
  listAttestations,
  uploadAttestation,
  downloadAttestation,
  generateAttestation, // ✅ NEW
  getHeuresSession,
  setHeuresSession,
  getTotalHeuresFormateur,
} from "../../services/formateur";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function safeText(v) {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function sessionTitle(s) {
  return (
    s?.formationTitre ||
    s?.formation?.titre ||
    s?.formation?.title ||
    s?.titreFormation ||
    "Formation"
  );
}

function sessionId(s) {
  return s?.id ?? s?.sessionId ?? s?.idSession ?? null;
}

function sessionDateDebut(s) {
  return s?.dateDebut ?? s?.debut ?? s?.startDate ?? "";
}

function sessionDateFin(s) {
  return s?.dateFin ?? s?.fin ?? s?.endDate ?? "";
}

function badgeKind(statut) {
  const x = safeText(statut).toUpperCase();
  if (x.includes("OUVER")) return "success";
  if (x.includes("PLAN")) return "warn";
  if (x.includes("FERM") || x.includes("ANNUL")) return "danger";
  return "neutral";
}

function isPayee(p) {
  if (typeof p?.payee === "boolean") return p.payee;
  const st = safeText(p?.statut || p?.statutInscription).toUpperCase();
  return st === "PAYEE" || st === "PAYÉE" || st === "PAYE";
}

function participantId(p) {
  return p?.inscriptionId ?? p?.idInscription ?? p?.id ?? null;
}

function participantNom(p) {
  const prenom = p?.prenom ?? p?.firstName ?? "";
  const nom = p?.nom ?? p?.lastName ?? "";
  return `${prenom} ${nom}`.trim() || "—";
}

function participantEmail(p) {
  return p?.email ?? p?.mail ?? p?.utilisateurEmail ?? "";
}

function StatCard({ title, value, sub }) {
  return (
    <div className="f-card f-stat">
      <div className="f-statTitle">{title}</div>
      <div className="f-statValue">{value}</div>
      {sub ? <div className="f-statSub">{sub}</div> : null}
    </div>
  );
}

function Badge({ children, kind = "neutral" }) {
  return <span className={`f-badge ${kind}`}>{children}</span>;
}

function downloadBlob(blob, filename = "attestation.pdf") {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function FormateurHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const profileName =
    user?.prenom || user?.nom
      ? `${user?.prenom || ""} ${user?.nom || ""}`.trim()
      : "Formateur";

  const [tab, setTab] = useState("sessions");

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [dateJour, setDateJour] = useState(todayISO());
  const [q, setQ] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [drafts, setDrafts] = useState({});
  const [loadingPresence, setLoadingPresence] = useState({});
  const [loadingEval, setLoadingEval] = useState({});

  // Attestations
  const [attMap, setAttMap] = useState({});
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [loadingGen, setLoadingGen] = useState({}); // ✅ NEW

  // Heures
  const [heuresData, setHeuresData] = useState(null);
  const [heuresInput, setHeuresInput] = useState(7);
  const [loadingHeures, setLoadingHeures] = useState(false);
  const [totalHeuresFormateur, setTotalHeuresFormateur] = useState(0);

  const selectedSession = useMemo(() => {
    const sid = selectedSessionId;
    return sessions.find((s) => sessionId(s) === sid) || null;
  }, [sessions, selectedSessionId]);

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const safeError = (e, fallback) =>
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    fallback;

  const loadTotalHeures = async () => {
    try {
      const t = await getTotalHeuresFormateur();
      setTotalHeuresFormateur(Number(t || 0));
    } catch {
      // ignore
    }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    setError("");
    setMsg("");
    try {
      const data = await mesSessionsFormateur();
      const list = Array.isArray(data) ? data : [];
      setSessions(list);

      const firstId = list.length ? sessionId(list[0]) : null;

      setSelectedSessionId((prev) => {
        if (prev && list.some((s) => sessionId(s) === prev)) return prev;
        return firstId;
      });
    } catch (e) {
      setError(safeError(e, "Impossible de charger tes sessions"));
      setSessions([]);
      setSelectedSessionId(null);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadParticipants = async (sid) => {
    if (!sid) return;
    setLoadingParticipants(true);
    setError("");
    setMsg("");
    try {
      const data = await participantsSession(sid);
      const list = Array.isArray(data) ? data : [];
      setParticipants(list);

      setDrafts((prev) => {
        const next = { ...prev };
        for (const p of list) {
          const id = participantId(p);
          if (!id) continue;
          if (!next[id]) next[id] = { note: 15, commentaire: "" };
        }
        return next;
      });
    } catch (e) {
      setError(safeError(e, "Impossible de charger les participants"));
      setParticipants([]);
      setDrafts({});
    } finally {
      setLoadingParticipants(false);
    }
  };

  const loadAttestations = async (sid) => {
    if (!sid) return;
    setLoadingAtt(true);
    setError("");
    setMsg("");
    try {
      const list = await listAttestations(sid);
      const map = {};
      for (const a of list || []) {
        map[a.inscriptionId] = a;
      }
      setAttMap(map);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les attestations"));
      setAttMap({});
    } finally {
      setLoadingAtt(false);
    }
  };

  const loadHeures = async (sid) => {
    if (!sid) return;
    setLoadingHeures(true);
    setError("");
    setMsg("");
    try {
      const data = await getHeuresSession(sid);
      setHeuresData(data);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les heures"));
      setHeuresData(null);
    } finally {
      setLoadingHeures(false);
    }
  };

  useEffect(() => {
    loadSessions();
    loadTotalHeures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSessionId) loadParticipants(selectedSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  useEffect(() => {
    if (tab === "heures" && selectedSessionId) loadHeures(selectedSessionId);
    if (tab === "attestations" && selectedSessionId) loadAttestations(selectedSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedSessionId]);

  // Stats haut
  const today = todayISO();
  const sessionsAVenir = sessions.filter((s) => safeText(sessionDateDebut(s)) >= today).length;

  const sessionDuJour = sessions.find((s) => {
    const d1 = safeText(sessionDateDebut(s));
    const d2 = safeText(sessionDateFin(s));
    return d1 <= today && today <= d2;
  });

  const nbApprenants = participants.length;
  const apprenantsPayes = participants.filter((p) => isPayee(p)).length;

  const filteredParticipants = useMemo(() => {
    const x = q.trim().toLowerCase();
    if (!x) return participants;
    return participants.filter((p) => {
      const name = participantNom(p).toLowerCase();
      const mail = participantEmail(p).toLowerCase();
      const st = safeText(p?.statut || p?.statutInscription).toLowerCase();
      return `${name} ${mail} ${st}`.includes(x);
    });
  }, [participants, q]);

  const onPresence = async (inscriptionId, present) => {
    setError("");
    setMsg("");
    setLoadingPresence((m) => ({ ...m, [inscriptionId]: true }));
    try {
      await marquerPresence({ inscriptionId, dateJour, present });
      setMsg(`✅ Émargement enregistré (${present ? "présent" : "absent"}) — inscription #${inscriptionId}`);
    } catch (e) {
      setError(safeError(e, "Erreur émargement"));
    } finally {
      setLoadingPresence((m) => ({ ...m, [inscriptionId]: false }));
    }
  };

  const setDraft = (inscriptionId, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [inscriptionId]: { ...(prev[inscriptionId] || {}), ...patch },
    }));
  };

  const onEval = async (p) => {
    setError("");
    setMsg("");

    const inscriptionId = participantId(p);
    if (!inscriptionId) return;

    if (!isPayee(p)) {
      setError("Tu peux noter uniquement les inscriptions PAYÉES.");
      return;
    }

    const d = drafts[inscriptionId] || { note: 0, commentaire: "" };
    const noteNum = Number(d.note);

    if (Number.isNaN(noteNum) || noteNum < 0 || noteNum > 20) {
      setError("La note doit être entre 0 et 20");
      return;
    }

    setLoadingEval((m) => ({ ...m, [inscriptionId]: true }));
    try {
      await enregistrerEvaluation({
        inscriptionId,
        note: noteNum,
        commentaire: d.commentaire || null,
      });
      setMsg(`✅ Évaluation enregistrée — inscription #${inscriptionId}`);
      // auto-génération côté backend, visible dans l’onglet attestations après refresh
    } catch (e) {
      setError(safeError(e, "Erreur évaluation"));
    } finally {
      setLoadingEval((m) => ({ ...m, [inscriptionId]: false }));
    }
  };

  return (
    <FormateurLayout
      tab={tab}
      setTab={setTab}
      profileName={profileName}
      onLogout={onLogout}
      heroTitle="Bonjour,"
    >
      <div className="f-wrap">
        {msg ? <div className="f-alert ok">{msg}</div> : null}
        {error ? <div className="f-alert ko">{error}</div> : null}

        <div className="f-statsRow">
          <StatCard title="Sessions à venir" value={sessionsAVenir} />
          <StatCard
            title="Session du jour"
            value={sessionDuJour ? sessionTitle(sessionDuJour) : "—"}
            sub={sessionDuJour ? `${sessionDateDebut(sessionDuJour)} → ${sessionDateFin(sessionDuJour)}` : ""}
          />
          <StatCard title="Apprenants (session)" value={nbApprenants} sub={`${apprenantsPayes} payés`} />
        </div>

        {/* ---------------- TAB SESSIONS ---------------- */}
        {tab === "sessions" && (
          <div className="f-grid">
            <div className="f-card">
              <div className="f-cardTitle">
                Mes sessions
                <div className="f-actions">
                  <button className="f-btn ghost" onClick={loadSessions} disabled={loadingSessions}>
                    {loadingSessions ? "..." : "Rafraîchir"}
                  </button>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="f-muted">Aucune session assignée.</div>
              ) : (
                <div className="f-sessionList">
                  {sessions.map((s) => {
                    const sid = sessionId(s);
                    const active = sid === selectedSessionId;
                    return (
                      <button
                        key={sid}
                        type="button"
                        className={`f-sessionItem ${active ? "active" : ""}`}
                        onClick={() => setSelectedSessionId(sid)}
                      >
                        <div className="f-sessionTop">
                          <div className="f-sessionName">{sessionTitle(s)}</div>
                          <Badge kind={badgeKind(s?.statut)}>{safeText(s?.statut) || "—"}</Badge>
                        </div>
                        <div className="f-sessionSub">
                          #{sid} • {sessionDateDebut(s)} → {sessionDateFin(s)} • Salle: {s?.salle || "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="f-card">
              <div className="f-cardTitle">
                Participants & Émargement
                <div className="f-actions">
                  <div className="f-inline">
                    <span className="f-muted">Date :</span>
                    <input className="f-input" type="date" value={dateJour} onChange={(e) => setDateJour(e.target.value)} />
                  </div>

                  <button
                    className="f-btn ghost"
                    onClick={() => selectedSessionId && loadParticipants(selectedSessionId)}
                    disabled={!selectedSessionId || loadingParticipants}
                  >
                    {loadingParticipants ? "..." : "Rafraîchir"}
                  </button>
                </div>
              </div>

              {!selectedSessionId ? (
                <div className="f-muted">Sélectionne une session.</div>
              ) : loadingParticipants ? (
                <div className="f-muted">Chargement participants…</div>
              ) : (
                <>
                  <div className="f-toolbar">
                    <input
                      className="f-input"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Rechercher un apprenant (nom, email, statut)…"
                    />
                  </div>

                  <div className="f-tableWrap">
                    <table className="f-table">
                      <thead>
                        <tr>
                          <th>Apprenant</th>
                          <th>Statut</th>
                          <th>Paiement</th>
                          <th>Émargement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParticipants.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="f-muted" style={{ padding: 14 }}>
                              Aucun participant.
                            </td>
                          </tr>
                        ) : (
                          filteredParticipants.map((p) => {
                            const id = participantId(p);
                            const st = safeText(p?.statut || p?.statutInscription) || "—";
                            const pay = isPayee(p);
                            const lp = !!loadingPresence[id];

                            return (
                              <tr key={id}>
                                <td>
                                  <div className="f-tdTitle">{participantNom(p)}</div>
                                  <div className="f-tdSub">{participantEmail(p) || "—"} • Inscription #{id}</div>
                                </td>
                                <td>
                                  <Badge kind="neutral">{st}</Badge>
                                </td>
                                <td>
                                  {pay ? <Badge kind="success">PAYÉE</Badge> : <Badge kind="warn">NON PAYÉE</Badge>}
                                </td>
                                <td>
                                  <div className="f-rowBtns">
                                    <button className="f-btn ok" onClick={() => onPresence(id, true)} disabled={!id || lp}>
                                      {lp ? "..." : "Présent"}
                                    </button>
                                    <button className="f-btn danger" onClick={() => onPresence(id, false)} disabled={!id || lp}>
                                      {lp ? "..." : "Absent"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---------------- TAB EVALUATIONS ---------------- */}
        {tab === "evaluations" && (
          <div className="f-card">
            <div className="f-cardTitle">
              Évaluations (sur la session sélectionnée)
              <div className="f-actions">
                <button
                  className="f-btn ghost"
                  onClick={() => selectedSessionId && loadParticipants(selectedSessionId)}
                  disabled={!selectedSessionId || loadingParticipants}
                >
                  {loadingParticipants ? "..." : "Rafraîchir"}
                </button>
              </div>
            </div>

            {!selectedSessionId ? (
              <div className="f-muted">Va dans “Mes sessions” et sélectionne une session.</div>
            ) : (
              <>
                <div className="f-muted" style={{ marginBottom: 10 }}>
                  Session #{selectedSessionId} — {selectedSession ? sessionTitle(selectedSession) : ""}
                </div>

                <div className="f-tableWrap">
                  <table className="f-table">
                    <thead>
                      <tr>
                        <th>Apprenant</th>
                        <th>Note</th>
                        <th>Commentaire</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="f-muted" style={{ padding: 14 }}>
                            Aucun participant.
                          </td>
                        </tr>
                      ) : (
                        participants.map((p) => {
                          const id = participantId(p);
                          const pay = isPayee(p);
                          const d = drafts[id] || { note: 15, commentaire: "" };
                          const le = !!loadingEval[id];

                          return (
                            <tr key={id}>
                              <td>
                                <div className="f-tdTitle">{participantNom(p)}</div>
                                <div className="f-tdSub">{participantEmail(p) || "—"} • Inscription #{id}</div>
                              </td>
                              <td style={{ width: 110 }}>
                                <input
                                  className="f-input"
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={d.note}
                                  onChange={(e) => setDraft(id, { note: e.target.value })}
                                  disabled={!pay}
                                />
                              </td>
                              <td>
                                <input
                                  className="f-input"
                                  placeholder={pay ? "Commentaire (optionnel)" : "Paiement requis"}
                                  value={d.commentaire}
                                  onChange={(e) => setDraft(id, { commentaire: e.target.value })}
                                  disabled={!pay}
                                />
                              </td>
                              <td style={{ width: 160 }}>
                                <button className="f-btn" onClick={() => onEval(p)} disabled={!pay || !id || le}>
                                  {le ? "..." : "Valider"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="f-muted" style={{ marginTop: 10 }}>
                  ✅ Règle : on note uniquement les inscriptions PAYÉES.
                </div>
              </>
            )}
          </div>
        )}

        {/* ---------------- TAB ATTESTATIONS ---------------- */}
        {tab === "attestations" && (
          <div className="f-card">
            <div className="f-cardTitle">
              Attestations (PDF)
              <div className="f-actions">
                <button
                  className="f-btn ghost"
                  onClick={() => selectedSessionId && loadAttestations(selectedSessionId)}
                  disabled={!selectedSessionId || loadingAtt}
                >
                  {loadingAtt ? "..." : "Rafraîchir"}
                </button>
              </div>
            </div>

            {!selectedSessionId ? (
              <div className="f-muted">Sélectionne une session dans “Mes sessions”.</div>
            ) : loadingParticipants ? (
              <div className="f-muted">Chargement participants…</div>
            ) : (
              <>
                <div className="f-muted" style={{ marginBottom: 10 }}>
                  Choix formateur : générer automatiquement (PDF officiel) OU uploader un PDF existant.
                </div>

                <div className="f-tableWrap">
                  <table className="f-table">
                    <thead>
                      <tr>
                        <th>Apprenant</th>
                        <th>Paiement</th>
                        <th>Attestation</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="f-muted" style={{ padding: 14 }}>
                            Aucun participant.
                          </td>
                        </tr>
                      ) : (
                        participants.map((p) => {
                          const id = participantId(p);
                          const pay = isPayee(p);
                          const meta = id ? attMap[id] : null;
                          const has = !!meta?.hasAttestation;
                          const lg = !!loadingGen[id];

                          return (
                            <tr key={id}>
                              <td>
                                <div className="f-tdTitle">{participantNom(p)}</div>
                                <div className="f-tdSub">{participantEmail(p) || "—"} • Inscription #{id}</div>
                              </td>
                              <td>
                                {pay ? <Badge kind="success">PAYÉE</Badge> : <Badge kind="warn">NON PAYÉE</Badge>}
                              </td>
                              <td>
                                {has ? <Badge kind="success">OK</Badge> : <Badge kind="neutral">Aucune</Badge>}
                              </td>
                              <td>
                                <div className="f-rowBtns">
                                  {/* ✅ NEW: Générer */}
                                  <button
                                    className="f-btn"
                                    disabled={!pay || !id || lg}
                                    onClick={async () => {
                                      try {
                                        setMsg("");
                                        setError("");
                                        setLoadingGen((m) => ({ ...m, [id]: true }));
                                        await generateAttestation(id);
                                        setMsg(`✅ Attestation générée — inscription #${id}`);
                                        await loadAttestations(selectedSessionId);
                                      } catch (err) {
                                        setError(safeError(err, "Génération impossible (évaluation requise ?)"));
                                      } finally {
                                        setLoadingGen((m) => ({ ...m, [id]: false }));
                                      }
                                    }}
                                  >
                                    {lg ? "..." : "Générer"}
                                  </button>

                                  {/* Upload */}
                                  <label
                                    className="f-btn ghost"
                                    style={{ cursor: pay ? "pointer" : "not-allowed", opacity: pay ? 1 : 0.6 }}
                                  >
                                    Upload PDF
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      style={{ display: "none" }}
                                      disabled={!pay}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        e.target.value = "";
                                        if (!file || !id) return;

                                        if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
                                          setError("Seuls les PDF sont acceptés.");
                                          return;
                                        }

                                        try {
                                          setMsg("");
                                          setError("");
                                          await uploadAttestation({ inscriptionId: id, file });
                                          setMsg(`✅ Attestation uploadée — inscription #${id}`);
                                          await loadAttestations(selectedSessionId);
                                        } catch (err) {
                                          setError(safeError(err, "Upload impossible"));
                                        }
                                      }}
                                    />
                                  </label>

                                  {/* Download */}
                                  <button
                                    className="f-btn"
                                    disabled={!has}
                                    onClick={async () => {
                                      try {
                                        setMsg("");
                                        setError("");
                                        const blob = await downloadAttestation(id);
                                        downloadBlob(blob, `attestation-${id}.pdf`);
                                      } catch (err) {
                                        setError(safeError(err, "Téléchargement impossible"));
                                      }
                                    }}
                                  >
                                    Télécharger
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---------------- TAB HEURES ---------------- */}
        {tab === "heures" && (
          <div className="f-card">
            <div className="f-cardTitle">
              Heures réalisées
              <div className="f-actions">
                <button
                  className="f-btn ghost"
                  onClick={() => selectedSessionId && loadHeures(selectedSessionId)}
                  disabled={!selectedSessionId || loadingHeures}
                >
                  {loadingHeures ? "..." : "Rafraîchir"}
                </button>
              </div>
            </div>

            {!selectedSessionId ? (
              <div className="f-muted">Sélectionne une session.</div>
            ) : loadingHeures ? (
              <div className="f-muted">Chargement…</div>
            ) : !heuresData ? (
              <div className="f-muted">Aucune donnée.</div>
            ) : (
              <>
                <div className="f-statsRow" style={{ marginTop: 10 }}>
                  <StatCard title="Total (formateur)" value={`${totalHeuresFormateur}h`} />
                  <StatCard title="Total (session)" value={`${heuresData.totalHeures || 0}h`} />
                  <StatCard title="Théorique (formation)" value={`${heuresData.heuresTheoriques || 0}h`} />
                </div>

                <div className="f-card" style={{ marginTop: 12 }}>
                  <div className="f-cardTitle">Ajouter / modifier les heures du jour</div>

                  <div className="f-actions" style={{ justifyContent: "flex-start" }}>
                    <div className="f-inline">
                      <span className="f-muted">Date :</span>
                      <input
                        className="f-input"
                        type="date"
                        value={dateJour}
                        onChange={(e) => setDateJour(e.target.value)}
                        style={{ maxWidth: 200 }}
                      />
                    </div>

                    <div className="f-inline">
                      <span className="f-muted">Heures :</span>
                      <input
                        className="f-input"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={heuresInput}
                        onChange={(e) => setHeuresInput(e.target.value)}
                        style={{ maxWidth: 140 }}
                      />
                    </div>

                    <button
                      className="f-btn"
                      onClick={async () => {
                        const h = Number(heuresInput);
                        if (Number.isNaN(h) || h <= 0) {
                          setError("Heures invalides.");
                          return;
                        }

                        try {
                          setMsg("");
                          setError("");
                          await setHeuresSession({
                            sessionId: selectedSessionId,
                            dateJour,
                            heures: h,
                          });
                          setMsg("✅ Heures enregistrées");
                          await loadHeures(selectedSessionId);
                          await loadTotalHeures();
                        } catch (err) {
                          setError(safeError(err, "Erreur enregistrement heures"));
                        }
                      }}
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>

                <div className="f-card" style={{ marginTop: 12 }}>
                  <div className="f-cardTitle">Historique (session)</div>

                  <div className="f-tableWrap">
                    <table className="f-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Heures</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(heuresData.entries || []).length === 0 ? (
                          <tr>
                            <td colSpan="2" className="f-muted" style={{ padding: 14 }}>
                              Aucune saisie pour cette session.
                            </td>
                          </tr>
                        ) : (
                          (heuresData.entries || []).map((e) => (
                            <tr key={e.dateJour}>
                              <td>{e.dateJour}</td>
                              <td>
                                <b>{e.heures}h</b>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </FormateurLayout>
  );
}
