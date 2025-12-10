<h1>
  DL Querys
</h1>

<h2>
  🔨En construccion
</h2>
<ul>
  <li>Pregunta 2:</li>
  <code>Tratamiento_Medico that combate some (Cancer and cancer_nombre value "Cancer de pancreas")</code>
  <br>
  <code>Tratamiento that combate some (Cancer and cancer_nombre value "Cancer de pancreas")</code>
  <br>
  <code>Tratamiento that combate some (Cancer that afectaOrgano some Organo)</code>
  <li>Pregunta 3:</li>
  <code>Organo that esAfectadoPor some (Cancer and cancer_nombre value "Cancer de prostata")</code>
  <li>Pregunta 5:</li>
  <code>Alimento_Permitido that combate some Cancer</code>
  <li>Pregunta 6:</li>
  <code>Alimento_Restringuido that combate some Cancer</code>
  <li>Pregunta 10:</li>
  <code>Centro_medico that ofreceTratamiento some (Tratamiento_Medico that combate some (Cancer and cancer_nombre value "Cancer de pulmon"))</code>
  <br>
  <code>Centro_medico that ofreceTratamiento only (Tratamiento or Tratamiento_Medico that combate some (Cancer and cancer_nombre value "Cancer de pulmon"))</code>
  <li>Pregunta 11:</li>
  <code>Remedio_Herbal that combate some (Cancer and cancer_nombre value "Cancer uterino")</code>
  <br>
  <code>Remedio_Herbal that combate some (Cancer and afectaOrgano value Organo_10)</code>
  <li>Pregunta 18:</li>
  <code>Tratamiento that combate some (Cancer and cancer_nombre value "Cancer de mama")</code>
  <br>
  <code>Tratamiento that combate some (Cancer that afectaOrgano some (Organo and organo_nombre value "Mama"))</code>
  <li>Pregunta 19:</li>
  <code>Organo that esAfectadoPor some (Cancer and cancer_nombre value "Cancer de estomago")</code>
  <li>Pregunta 22:</li>
  <code>Alimento_Permitido that combate only (Cancer and cancer_nombre value "Cancer de ovario")</code>
  <li>Pregunta 28:</li>
  <code>Centro_medico that ofreceTratamiento some (Tratamiento_Medico that combate some (Cancer and cancer_nombre value "Cancer de pancreas"))</code>
</ul>
