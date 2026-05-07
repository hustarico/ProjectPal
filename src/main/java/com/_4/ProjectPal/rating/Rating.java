package com._4.ProjectPal.rating;

import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "rater_id", nullable = false)
    private User rater;

    @ManyToOne
    @JoinColumn(name = "ratee_id", nullable = false)
    private User ratee;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Integer score;
}