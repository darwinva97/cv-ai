"use client";

import type { ResumeStyleConfig } from "@/db/schema/style";
import type { Basics, Work, Education, Skill, Project, Language } from "@/types/resume";

interface ResumePreviewProps {
  config: ResumeStyleConfig;
  basics: Basics;
  work?: Work[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  languages?: Language[];
}

export function ResumePreview({
  config,
  basics,
  work = [],
  education = [],
  skills = [],
  projects = [],
  languages = [],
}: ResumePreviewProps) {
  const { colors, typography, spacing, layout, sections, extras } = config;

  // Format date helper
  const formatDate = (date?: string) => {
    if (!date) return "";
    if (date === "Present" || date === "Presente") return "Presente";
    const [year, month] = date.split("-");
    if (!year) return date;
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return month ? `${monthNames[parseInt(month) - 1]} ${year}` : year;
  };

  const renderDateRange = (startDate?: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (!start && !end) return null;
    return `${start}${end ? ` - ${end}` : ""}`;
  };

  // Contact info as compact line with separators
  const contactItems = [
    basics.email,
    basics.phone,
    basics.location?.city ? `${basics.location.city}${basics.location.countryCode ? `, ${basics.location.countryCode}` : ""}` : null,
    basics.url ? "Portfolio" : null,
  ].filter(Boolean);

  // Section header - clean and professional
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        fontFamily: typography.headingFont,
        fontSize: `${typography.headingSizes.h2}px`,
        fontWeight: 600,
        color: colors.primary,
        textTransform: sections.sectionStyle as "uppercase" | "capitalize" | "none",
        letterSpacing: sections.sectionStyle === "uppercase" ? "0.1em" : "0",
        marginBottom: "12px",
        paddingBottom: sections.dividers ? "6px" : "0",
        borderBottom: sections.dividers ? `1.5px solid ${colors.primary}` : "none",
      }}
    >
      {children}
    </div>
  );

  // Skill rendering
  const renderSkills = () => {
    if (extras.skillStyle === "badge") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {skills.map((skill, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "4px 10px",
                backgroundColor: colors.primary,
                color: "#fff",
                borderRadius: `${extras.borderRadius}px`,
                fontSize: `${typography.baseFontSize * 0.85}px`,
                fontFamily: typography.bodyFont,
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      );
    }

    if (extras.skillStyle === "bar") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
          {skills.map((skill, i) => (
            <div key={i}>
              <div style={{
                fontSize: `${typography.baseFontSize * 0.9}px`,
                marginBottom: "3px",
                color: colors.text,
              }}>
                {skill.name}
              </div>
              <div style={{
                height: "4px",
                backgroundColor: colors.border,
                borderRadius: "2px",
              }}>
                <div style={{
                  width: "80%",
                  height: "100%",
                  backgroundColor: colors.primary,
                  borderRadius: "2px",
                }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default: simple comma-separated or bullet list
    return (
      <div style={{
        fontSize: `${typography.baseFontSize}px`,
        color: colors.text,
        lineHeight: 1.6,
      }}>
        {skills.map((skill, i) => (
          <span key={i}>
            {skill.name}{i < skills.length - 1 ? " • " : ""}
          </span>
        ))}
      </div>
    );
  };

  // Two-column / Sidebar layouts
  if (layout.type === "two-column" || layout.type === "sidebar-left" || layout.type === "sidebar-right") {
    const sidebarWidth = layout.sidebarWidth || 35;
    const isLeftSidebar = layout.type === "sidebar-left" || layout.type === "two-column";

    const sidebar = (
      <div
        style={{
          width: `${sidebarWidth}%`,
          backgroundColor: colors.backgroundAlt,
          padding: `${spacing.contentPadding}px`,
        }}
      >
        {/* Contact */}
        <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <SectionTitle>Contacto</SectionTitle>
          <div style={{
            fontSize: `${typography.baseFontSize * 0.9}px`,
            color: colors.text,
            lineHeight: 1.8,
          }}>
            {basics.email && <div>{basics.email}</div>}
            {basics.phone && <div>{basics.phone}</div>}
            {basics.location?.city && (
              <div>{basics.location.city}{basics.location.countryCode && `, ${basics.location.countryCode}`}</div>
            )}
          </div>
        </div>

        {/* Skills */}
        {sections.visible.includes("skills") && skills.length > 0 && (
          <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
            <SectionTitle>Habilidades</SectionTitle>
            {extras.skillStyle === "bar" ? (
              <div>
                {skills.map((skill, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div style={{
                      fontSize: `${typography.baseFontSize * 0.9}px`,
                      marginBottom: "3px",
                      color: colors.text,
                    }}>
                      {skill.name}
                    </div>
                    <div style={{
                      height: "4px",
                      backgroundColor: colors.border,
                      borderRadius: "2px",
                    }}>
                      <div style={{
                        width: "80%",
                        height: "100%",
                        backgroundColor: colors.primary,
                        borderRadius: "2px",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                fontSize: `${typography.baseFontSize * 0.9}px`,
                color: colors.text,
                lineHeight: 1.8,
              }}>
                {skills.map((skill, i) => (
                  <div key={i}>• {skill.name}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Languages */}
        {sections.visible.includes("languages") && languages.length > 0 && (
          <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
            <SectionTitle>Idiomas</SectionTitle>
            <div style={{
              fontSize: `${typography.baseFontSize * 0.9}px`,
              color: colors.text,
              lineHeight: 1.8,
            }}>
              {languages.map((lang, i) => (
                <div key={i}>
                  {lang.language}{lang.fluency && ` - ${lang.fluency}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education in sidebar for two-column */}
        {layout.type === "two-column" && sections.visible.includes("education") && education.length > 0 && (
          <div>
            <SectionTitle>Educación</SectionTitle>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{
                  fontSize: `${typography.baseFontSize}px`,
                  fontWeight: 600,
                  color: colors.text,
                }}>
                  {edu.area}
                </div>
                <div style={{
                  fontSize: `${typography.baseFontSize * 0.9}px`,
                  color: colors.textMuted,
                }}>
                  {edu.institution}
                </div>
                <div style={{
                  fontSize: `${typography.baseFontSize * 0.85}px`,
                  color: colors.textMuted,
                }}>
                  {renderDateRange(edu.startDate, edu.endDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const mainContent = (
      <div
        style={{
          flex: 1,
          padding: `${spacing.contentPadding}px`,
          backgroundColor: colors.background,
        }}
      >
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: `${spacing.sectionGap}px`,
          paddingBottom: "16px",
          borderBottom: `2px solid ${colors.primary}`,
        }}>
          {basics.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={basics.image}
              alt={basics.name || "Foto de perfil"}
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                objectFit: "cover",
                margin: "0 auto 12px",
                border: `3px solid ${colors.primary}`,
                display: "block",
              }}
            />
          )}
          <h1 style={{
            fontFamily: typography.headingFont,
            fontSize: `${typography.headingSizes.h1 + 12}px`,
            fontWeight: 700,
            color: colors.primary,
            margin: 0,
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            {basics.name || "Tu Nombre"}
          </h1>
          {basics.label && (
            <p style={{
              fontFamily: typography.bodyFont,
              fontSize: `${typography.headingSizes.h2}px`,
              color: colors.textMuted,
              margin: 0,
              letterSpacing: "0.05em",
            }}>
              {basics.label}
            </p>
          )}
        </div>

        {/* Summary */}
        {sections.visible.includes("summary") && basics.summary && (
          <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
            <SectionTitle>Perfil</SectionTitle>
            <p style={{
              fontSize: `${typography.baseFontSize}px`,
              lineHeight: typography.lineHeight,
              color: colors.text,
              margin: 0,
              textAlign: "justify",
            }}>
              {basics.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {sections.visible.includes("work") && work.length > 0 && (
          <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
            <SectionTitle>Experiencia Profesional</SectionTitle>
            {work.map((item, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                }}>
                  <span style={{
                    fontSize: `${typography.baseFontSize + 1}px`,
                    fontWeight: 600,
                    color: colors.text,
                  }}>
                    {item.position}
                  </span>
                  <span style={{
                    fontSize: `${typography.baseFontSize * 0.85}px`,
                    color: colors.textMuted,
                  }}>
                    {renderDateRange(item.startDate, item.endDate)}
                  </span>
                </div>
                <div style={{
                  fontSize: `${typography.baseFontSize}px`,
                  color: colors.primary,
                  fontWeight: 500,
                  marginBottom: "6px",
                }}>
                  {item.name}
                </div>
                {item.summary && (
                  <p style={{
                    fontSize: `${typography.baseFontSize}px`,
                    lineHeight: typography.lineHeight,
                    color: colors.text,
                    margin: 0,
                  }}>
                    {item.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education for sidebar layouts */}
        {(layout.type === "sidebar-left" || layout.type === "sidebar-right") &&
         sections.visible.includes("education") && education.length > 0 && (
          <div>
            <SectionTitle>Educación</SectionTitle>
            {education.map((edu, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "8px",
              }}>
                <div>
                  <span style={{
                    fontSize: `${typography.baseFontSize + 1}px`,
                    fontWeight: 600,
                    color: colors.text,
                  }}>
                    {edu.area}
                  </span>
                  <span style={{
                    fontSize: `${typography.baseFontSize}px`,
                    color: colors.textMuted,
                    marginLeft: "8px",
                  }}>
                    - {edu.institution}
                  </span>
                </div>
                <span style={{
                  fontSize: `${typography.baseFontSize * 0.85}px`,
                  color: colors.textMuted,
                }}>
                  {renderDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div
        style={{
          display: "flex",
          maxWidth: `${layout.maxWidth}px`,
          margin: "0 auto",
          fontFamily: typography.bodyFont,
          backgroundColor: colors.background,
          borderRadius: `${extras.borderRadius}px`,
          overflow: "hidden",
          boxShadow: extras.shadowLevel !== "none" ? "0 2px 12px rgba(0, 0, 0, 0.08)" : "none",
        }}
      >
        {isLeftSidebar ? (
          <>
            {sidebar}
            {mainContent}
          </>
        ) : (
          <>
            {mainContent}
            {sidebar}
          </>
        )}
      </div>
    );
  }

  // =============================================
  // SINGLE COLUMN LAYOUT - Classic CV style
  // =============================================
  return (
    <div
      style={{
        maxWidth: `${layout.maxWidth}px`,
        margin: "0 auto",
        padding: `${spacing.pagePadding}px`,
        backgroundColor: colors.background,
        fontFamily: typography.bodyFont,
        borderRadius: `${extras.borderRadius}px`,
        boxShadow: extras.shadowLevel !== "none" ? "0 2px 12px rgba(0, 0, 0, 0.08)" : "none",
      }}
    >
      {/* Header - Centered, prominent name */}
      <div style={{
        textAlign: "center",
        marginBottom: `${spacing.sectionGap + 8}px`,
        paddingBottom: "20px",
        borderBottom: `2px solid ${colors.primary}`,
      }}>
        {basics.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={basics.image}
            alt={basics.name || "Foto de perfil"}
            style={{
              width: "108px",
              height: "108px",
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 14px",
              border: `3px solid ${colors.primary}`,
              display: "block",
            }}
          />
        )}
        <h1 style={{
          fontFamily: typography.headingFont,
          fontSize: `${typography.headingSizes.h1 + 16}px`,
          fontWeight: 700,
          color: colors.primary,
          margin: 0,
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}>
          {basics.name || "Tu Nombre"}
        </h1>

        {basics.label && (
          <p style={{
            fontSize: `${typography.headingSizes.h2 + 2}px`,
            color: colors.textMuted,
            margin: 0,
            marginBottom: "16px",
            letterSpacing: "0.05em",
            fontWeight: 400,
          }}>
            {basics.label}
          </p>
        )}

        {/* Contact - Single line with separators */}
        <div style={{
          fontSize: `${typography.baseFontSize * 0.9}px`,
          color: colors.text,
        }}>
          {contactItems.join("  |  ")}
        </div>
      </div>

      {/* Summary / Profile */}
      {sections.visible.includes("summary") && basics.summary && (
        <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <SectionTitle>Perfil Profesional</SectionTitle>
          <p style={{
            fontSize: `${typography.baseFontSize}px`,
            lineHeight: typography.lineHeight,
            color: colors.text,
            margin: 0,
            textAlign: "justify",
          }}>
            {basics.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {sections.visible.includes("work") && work.length > 0 && (
        <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <SectionTitle>Experiencia Profesional</SectionTitle>
          {work.map((item, i) => (
            <div key={i} style={{ marginBottom: "18px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "2px",
              }}>
                <span style={{
                  fontSize: `${typography.baseFontSize + 2}px`,
                  fontWeight: 600,
                  color: colors.text,
                }}>
                  {item.position}
                </span>
                <span style={{
                  fontSize: `${typography.baseFontSize * 0.9}px`,
                  color: colors.textMuted,
                  fontStyle: "italic",
                }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </span>
              </div>
              <div style={{
                fontSize: `${typography.baseFontSize}px`,
                color: colors.primary,
                fontWeight: 500,
                marginBottom: "8px",
              }}>
                {item.name}
              </div>
              {item.summary && (
                <p style={{
                  fontSize: `${typography.baseFontSize}px`,
                  lineHeight: typography.lineHeight,
                  color: colors.text,
                  margin: 0,
                }}>
                  {item.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {sections.visible.includes("education") && education.length > 0 && (
        <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <SectionTitle>Educación</SectionTitle>
          {education.map((edu, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "10px",
            }}>
              <div>
                <span style={{
                  fontSize: `${typography.baseFontSize + 1}px`,
                  fontWeight: 600,
                  color: colors.text,
                }}>
                  {edu.studyType && `${edu.studyType} en `}{edu.area}
                </span>
                <span style={{
                  fontSize: `${typography.baseFontSize}px`,
                  color: colors.textMuted,
                }}>
                  {" — "}{edu.institution}
                </span>
              </div>
              <span style={{
                fontSize: `${typography.baseFontSize * 0.9}px`,
                color: colors.textMuted,
                fontStyle: "italic",
              }}>
                {renderDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {sections.visible.includes("skills") && skills.length > 0 && (
        <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <SectionTitle>Habilidades</SectionTitle>
          {renderSkills()}
        </div>
      )}

      {/* Projects */}
      {sections.visible.includes("projects") && projects.length > 0 && (
        <div style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <SectionTitle>Proyectos</SectionTitle>
          {projects.map((project, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{
                fontSize: `${typography.baseFontSize + 1}px`,
                fontWeight: 600,
                color: colors.text,
                marginBottom: "4px",
              }}>
                {project.name}
              </div>
              {project.description && (
                <p style={{
                  fontSize: `${typography.baseFontSize}px`,
                  lineHeight: typography.lineHeight,
                  color: colors.text,
                  margin: 0,
                }}>
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {sections.visible.includes("languages") && languages.length > 0 && (
        <div>
          <SectionTitle>Idiomas</SectionTitle>
          <div style={{
            fontSize: `${typography.baseFontSize}px`,
            color: colors.text,
          }}>
            {languages.map((lang, i) => (
              <span key={i}>
                <strong>{lang.language}</strong>
                {lang.fluency && ` (${lang.fluency})`}
                {i < languages.length - 1 ? "  •  " : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumePreview;
