package com.txlforma.sae501backend.dto.inscription;

import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.Intervenant;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutSession;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class InscriptionDto {

    // inscription
    private Long id;
    private StatutInscription statut;
    private LocalDateTime dateInscription;

    // user
    private Long utilisateurId;

    // session
    private Long sessionId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String salle;
    private Integer nbPlacesMax;
    private StatutSession sessionStatut;

    // formation
    private Long formationId;
    private String formationTitre;
    private Double formationPrix;
    private String formationNiveau;
    private Integer formationDureeHeures;

    // intervenant (optionnel)
    private Long intervenantId;
    private String intervenantNom;
    private String intervenantPrenom;
    private String intervenantEmail;

    public static InscriptionDto fromEntity(Inscription i) {
        Utilisateur u = i.getUtilisateur();
        SessionFormation s = i.getSession();

        // Formation (via session)
        var f = (s != null) ? s.getFormation() : null;

        // Intervenant (optionnel)
        Intervenant itv = (s != null) ? s.getIntervenant() : null;
        Utilisateur itvUser = (itv != null) ? itv.getUtilisateur() : null;

        return InscriptionDto.builder()
                .id(i.getId())
                .statut(i.getStatut())
                .dateInscription(i.getDateInscription())

                .utilisateurId(u != null ? u.getId() : null)

                .sessionId(s != null ? s.getId() : null)
                .dateDebut(s != null ? s.getDateDebut() : null)
                .dateFin(s != null ? s.getDateFin() : null)
                .salle(s != null ? s.getSalle() : null)
                .nbPlacesMax(s != null ? s.getNbPlacesMax() : null)
                .sessionStatut(s != null ? s.getStatut() : null)

                .formationId(f != null ? f.getId() : null)
                .formationTitre(f != null ? f.getTitre() : null)
                .formationPrix(f != null ? f.getPrix() : null)
                .formationNiveau(f != null ? f.getNiveau() : null)
                .formationDureeHeures(f != null ? f.getDureeHeures() : null)

                .intervenantId(itv != null ? itv.getId() : null)
                .intervenantNom(itvUser != null ? itvUser.getNom() : null)
                .intervenantPrenom(itvUser != null ? itvUser.getPrenom() : null)
                .intervenantEmail(itvUser != null ? itvUser.getEmail() : null)

                .build();
    }
}
