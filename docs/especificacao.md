# 3. DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE

## 3.1 Objetivos deste documento
Descrever e especificar as necessidades da Coordenação do Curso de Sistemas de Informação da PUC Minas que devem ser atendidas pelo projeto SCCA – Sistema de Cadastro de Cursos de Aperfeiçoamento.

## 3.2 Escopo do Produto  

### 3.2.1 Nome do produto e seus componentes principais  
O produto será denominado **GreenDrop – Plataforma de Conexão para Descarte de Resíduos**.  
Ele será composto por um **módulo principal web** que integra:  
- Cadastro e gerenciamento de pontos de coleta  
- Cadastro de usuários (indivíduos e organizações)  
- Mecanismo de busca de pontos de coleta por localização e tipo de resíduo  
- Módulo educativo com conteúdos sobre práticas corretas de descarte  
- Comunicação básica entre usuários e pontos de coleta  

### 3.2.2 Missão do produto  
Facilitar o acesso à informação sobre pontos de coleta de resíduos recicláveis e especiais, promovendo a conscientização ambiental e incentivando o descarte correto, de forma a reduzir o impacto socioambiental do descarte inadequado.  

### 3.2.3 Limites do produto  
O **GreenDrop** não realizará:  
- Processamento de pagamentos ou transações financeiras  
- Gestão logística de transporte de resíduos  
- Controle operacional direto sobre cooperativas de reciclagem  
- Avaliação de impacto ambiental em tempo real  
- Atendimento a usuários fora do território nacional (escopo limitado ao Brasil)  

### 3.2.4 Benefícios do produto  

| #  | Benefício                                    | Valor para o Cliente |
|----|----------------------------------------------|----------------------|
| 1  | Facilidade em localizar pontos de coleta     | Essencial            |
| 2  | Acesso a informações sobre descarte correto  | Essencial            |
| 3  | Contribuição para redução do descarte irregular | Essencial         |
| 4  | Comunicação e integração com pontos de coleta | Recomendável       |
| 5  | Estímulo à educação ambiental                | Recomendável         |

---

## 3.3 Descrição geral do produto  

### 3.3.1 Requisitos Funcionais  

| Código | Requisito Funcional | Descrição |
|--------|---------------------|-----------|
| RF1    | Gerenciar Pontos de Coleta | Incluir, alterar, excluir e consultar pontos de coleta cadastrados. |
| RF2    | Gerenciar Usuários | Incluir, alterar, excluir e consultar perfis de usuários (indivíduos e organizações). |
| RF3    | Gerenciar Autenticação | Restringir o acesso por meio de login e senha individual. |
| RF4    | Gerenciar Conteúdos Educativos | Disponibilizar e organizar materiais informativos sobre descarte correto e impactos ambientais. |
| RF5    | Buscar Pontos de Coleta | Localizar pontos de coleta com base no tipo de resíduo e na localização geográfica. |
| RF6    | Exibir Pontos de Coleta em Mapas | Apresentar pontos de coleta em mapas interativos. |
| RF7    | Sugerir Pontos de Coleta por Geolocalização | Identificar automaticamente a localização do usuário (com permissão) e sugerir pontos próximos. |
| RF8    | Filtrar Busca de Pontos de Coleta | Permitir filtros por tipo de resíduo, distância, horário de funcionamento e acessibilidade. |
| RF9    | Gerenciar Comunicação com Pontos de Coleta | Permitir que usuários enviem e recebam mensagens básicas dos pontos de coleta. |
| RF10   | Responder Dúvidas via Bot de Mensagens | Fornecer respostas automáticas a dúvidas sobre descarte e indicar pontos de coleta mais próximos em mapa. |
| RF11   | Gerenciar Notificações | Enviar notificações sobre novos pontos de coleta ou conteúdos educativos relevantes. |
| RF12   | Gerenciar Avaliações de Pontos de Coleta | Permitir que usuários avaliem e comentem pontos de coleta. |
| RF13   | Gerenciar Sistema de Pontuação | Registrar pontos para usuários a cada descarte validado em pontos de coleta. |
| RF14   | Gerenciar Resgate de Recompensas | Permitir que usuários utilizem pontos acumulados para concorrer a prêmios ou resgatar recompensas. |

---                                    |


### 3.3.2 Requisitos Não Funcionais  

| Código | Requisito Não Funcional (Restrição) |
|--------|-------------------------------------|
| RNF1   | O sistema deve garantir tempo de resposta inferior a 3 segundos nas operações mais frequentes. |
| RNF2   | O sistema deve ser responsivo, adaptando-se corretamente a diferentes tamanhos de tela (desktop, tablet, dispositivos móveis). |
| RNF3   | O sistema deve ser compatível com os principais navegadores (Chrome, Firefox, Edge). |
| RNF4   | Um usuário que não conhecer o sistema deve ser capaz de localizar um ponto de descarte específico em menos de 5 minutos. |
| RNF5   | O sistema deve seguir padrões de segurança reconhecidos para proteção de dados em trânsito e em repouso (ex.: criptografia ou protocolo seguro padrão da indústria). |
| RNF6   | O sistema deve suportar no mínimo 50 usuários simultâneos sem degradação perceptível de desempenho. |

### 3.3.3 Usuários  

| Ator                     | Descrição |
|---------------------------|-----------|
| **Administrador**         | Responsável pela gestão geral da plataforma (cadastro de pontos, usuários e conteúdos educativos). |
| **Organização/Ponto de Coleta** | Entidades que cadastram seus pontos de coleta, atualizam informações e interagem com usuários. |
| **Usuário Final (Indivíduo)**   | Cidadão que busca pontos de coleta, acessa informações educativas e pode interagir com pontos de coleta. |

## 3.4 Modelagem do Sistema

### 3.4.1 Diagrama de Casos de Uso

O diagrama de casos de uso apresentado na Figura 1 evidencia as funcionalidades principais do sistema. Nele, observa-se que o **Usuário** pode realizar operações como **buscar, filtrar, avaliar e interagir com pontos de coleta**, além de acessar **conteúdos educativos** e **resgatar recompensas**. Já o **Administrador**, além de possuir acesso a essas funcionalidades, também é responsável por **gerenciar usuários, pontos de coleta, conteúdos educativos e recompensas**, ampliando seu escopo de atuação no sistema.


#### Figura 1: Diagrama de Casos de Uso do Sistema.

![dcu](https://github.com/user-attachments/assets/41f6b731-b44e-43aa-911f-423ad6198f47)
 
### 3.4.2 Descrições de Casos de Uso

#### Gerenciar Pontos de Coleta (CSU01)

**Sumário:** O Administrador realiza a gestão (inclusão, alteração, exclusão e consulta) de pontos de coleta.  

**Ator Primário:** Administrador.  
**Ator Secundário:** Usuário.  

**Pré-condições:** O Administrador deve estar autenticado no sistema.  

**Fluxo Principal:**
1) O Administrador solicita a manutenção dos pontos de coleta.  
2) O Sistema apresenta as operações disponíveis: inclusão, alteração, exclusão e consulta.  
3) O Administrador seleciona a operação desejada.  
4) O Sistema executa a operação e confirma o resultado.  

**Fluxo Alternativo (3): Inclusão**  
a) O Administrador requisita a inclusão de um ponto de coleta.  
b) O Sistema apresenta um formulário para cadastro.  
c) O Administrador fornece as informações solicitadas.  
d) O Sistema valida os dados e salva o ponto.  

**Fluxo Alternativo (3): Alteração**  
a) O Administrador seleciona um ponto existente e edita os dados.  
b) O Sistema valida e atualiza as informações.  

**Fluxo Alternativo (3): Exclusão**  
a) O Administrador seleciona um ponto e solicita a exclusão.  
b) O Sistema confirma a exclusão ou informa impedimento.  

**Fluxo Alternativo (3): Consulta**  
a) O Administrador solicita a consulta de pontos de coleta.  
b) O Sistema apresenta a lista.  
c) O Administrador visualiza os detalhes.  

**Pós-condições:** O ponto foi incluído, alterado, excluído ou exibido.  

---

#### Gerenciar Usuários (CSU02)

**Sumário:** O Administrador realiza a gestão de usuários cadastrados (inclusão, alteração, exclusão e consulta).  

**Ator Primário:** Administrador.  
**Ator Secundário:** Usuário.  

**Pré-condições:** O Administrador deve estar autenticado.  

**Fluxo Principal:**
1) O Administrador solicita manutenção de usuários.  
2) O Sistema apresenta opções: inclusão, alteração, exclusão, consulta.  
3) O Administrador seleciona a operação.  
4) O Sistema executa a operação e confirma o resultado.  

**Fluxo Alternativo:** Similar ao CSU01 (inclusão, alteração, exclusão, consulta).  

**Pós-condições:** O usuário foi incluído, alterado, excluído ou exibido.  

---

#### Gerenciar Autenticação (CSU03)

**Sumário:** O sistema valida o acesso dos usuários via login e senha.  

**Ator Primário:** Usuário.  
**Ator Secundário:** Sistema.  

**Pré-condições:** Usuário deve estar cadastrado.  

**Fluxo Principal:**
1) O Usuário acessa a tela de login.  
2) O Sistema solicita credenciais.  
3) O Usuário informa login e senha.  
4) O Sistema valida credenciais e concede acesso.  

**Fluxo Alternativo (3): Credenciais inválidas**  
a) O Sistema informa erro e solicita nova tentativa.  

**Pós-condições:** O usuário está autenticado ou acesso é negado.  

---

#### Gerenciar Conteúdos Educativos (CSU04)

**Sumário:** O Administrador publica e organiza conteúdos educativos sobre descarte correto.  

**Ator Primário:** Administrador.  
**Ator Secundário:** Usuário.  

**Pré-condições:** Administrador deve estar autenticado.  

**Fluxo Principal:**
1) O Administrador acessa a área de conteúdos.  
2) O Sistema apresenta opções: incluir, alterar, excluir, organizar.  
3) O Administrador seleciona a operação.  
4) O Sistema processa a solicitação.  

**Fluxos Alternativos:** Inclusão, alteração, exclusão seguem o mesmo padrão dos casos anteriores.  

**Pós-condições:** O conteúdo foi atualizado ou consultado.  

---

#### Buscar Pontos de Coleta (CSU05)

**Sumário:** O Usuário pesquisa pontos de coleta pelo tipo de resíduo e localização.  

**Ator Primário:** Usuário.  
**Ator Secundário:** Sistema.  

**Pré-condições:** Usuário deve estar autenticado.  

**Fluxo Principal:**
1) O Usuário informa tipo de resíduo e/ou localização.  
2) O Sistema pesquisa na base.  
3) O Sistema apresenta lista de pontos correspondentes.  

**Fluxo Alternativo:** Nenhum ponto encontrado → Sistema exibe mensagem adequada.  

**Pós-condições:** O usuário obtém lista de pontos de coleta.  

---

#### Exibir Pontos de Coleta em Mapas (CSU06)

**Sumário:** O Usuário visualiza pontos de coleta em mapas interativos.  

**Ator Primário:** Usuário.  

**Pré-condições:** Deve haver pontos de coleta cadastrados.  

**Fluxo Principal:**
1) O Usuário acessa a visualização em mapa.  
2) O Sistema apresenta os pontos cadastrados.  
3) O Usuário interage com o mapa para ver detalhes.  

**Fluxo Alternativo:** Caso não haja pontos, exibe mensagem “Nenhum ponto encontrado”.  

**Pós-condições:** Os pontos foram apresentados em mapa.  

---

#### Sugerir Pontos de Coleta por Geolocalização (CSU07)

**Sumário:** O sistema identifica a localização do usuário e sugere pontos próximos.  

**Ator Primário:** Usuário.  

**Pré-condições:** Usuário deve autorizar compartilhamento da localização.  

**Fluxo Principal:**
1) O Usuário concede permissão de localização.  
2) O Sistema identifica posição atual.  
3) O Sistema sugere pontos de coleta próximos.  

**Fluxo Alternativo:** Usuário não permite → sistema não sugere.  

**Pós-condições:** Pontos próximos foram sugeridos.  

---

#### Filtrar Busca de Pontos de Coleta (CSU08)

**Sumário:** O Usuário aplica filtros na busca de pontos de coleta.  

**Ator Primário:** Usuário.  

**Pré-condições:** Deve existir busca inicial realizada.  

**Fluxo Principal:**
1) O Usuário acessa filtros.  
2) Seleciona critérios (tipo de resíduo, distância, horário, acessibilidade).  
3) O Sistema refina os resultados.  

**Pós-condições:** O usuário visualiza resultados filtrados.  

---

#### Gerenciar Comunicação com Pontos de Coleta (CSU09)

**Sumário:** O Usuário troca mensagens básicas com os pontos de coleta.  

**Ator Primário:** Usuário.  
**Ator Secundário:** Ponto de Coleta.  

**Pré-condições:** Usuário deve estar autenticado.  

**Fluxo Principal:**
1) O Usuário envia mensagem a um ponto.  
2) O Sistema entrega a mensagem.  
3) O Ponto de Coleta responde.  
4) O Sistema apresenta a resposta.  

**Pós-condições:** Mensagens foram trocadas.  

---

#### Responder Dúvidas via Bot de Mensagens (CSU10)

**Sumário:** O Bot responde automaticamente dúvidas sobre descarte.  

**Ator Primário:** Usuário.  
**Ator Secundário:** Bot.  

**Pré-condições:** Usuário deve acessar o chat.  

**Fluxo Principal:**
1) O Usuário envia dúvida.  
2) O Bot processa e retorna resposta automática.  

**Fluxo Alternativo:** Dúvida não compreendida → Bot apresenta mensagem padrão.  

**Pós-condições:** Usuário recebeu resposta ou sugestão.  

---

#### Gerenciar Notificações (CSU11)

**Sumário:** O Sistema envia notificações sobre novidades.  

**Ator Primário:** Sistema.  
**Ator Secundário:** Usuário.  

**Pré-condições:** Usuário deve estar cadastrado e permitir notificações.  

**Fluxo Principal:**
1) O Sistema identifica novo evento (ponto ou conteúdo).  
2) O Sistema dispara notificação para os usuários.  

**Pós-condições:** Usuários foram notificados.  

---

#### Gerenciar Avaliações de Pontos de Coleta (CSU12)

**Sumário:** O Usuário avalia pontos de coleta e insere comentários.  

**Ator Primário:** Usuário.  

**Pré-condições:** Usuário deve estar autenticado.  

**Fluxo Principal:**
1) O Usuário acessa a página de um ponto.  
2) Insere nota e/ou comentário.  
3) O Sistema registra a avaliação.  

**Pós-condições:** A avaliação foi armazenada.  

---

#### Gerenciar Sistema de Pontuação (CSU13)

**Sumário:** O Sistema registra pontos para usuários a cada descarte validado.  

**Ator Primário:** Usuário.  
**Ator Secundário:** Sistema.  

**Pré-condições:** Descarte deve ser validado por ponto de coleta.  

**Fluxo Principal:**
1) O Ponto confirma descarte.  
2) O Sistema registra pontos para o usuário.  

**Pós-condições:** O saldo de pontos foi atualizado.  

---

#### Gerenciar Resgate de Recompensas (CSU14)

**Sumário:** O Usuário resgata recompensas com base na pontuação acumulada.  

**Ator Primário:** Usuário.  
**Ator Secundário:** Sistema.  

**Pré-condições:** Usuário deve possuir pontos suficientes.  

**Fluxo Principal:**
1) O Usuário acessa o catálogo de recompensas.  
2) Seleciona uma recompensa.  
3) O Sistema valida saldo de pontos.  
4) O Sistema confirma resgate.  

**Fluxo Alternativo:** Pontos insuficientes → Sistema exibe mensagem de erro.  

**Pós-condições:** O resgate foi efetuado ou negado.  


### 3.4.3 Diagrama de Classes 

A Figura 2 mostra o diagrama de classes do sistema. A Matrícula deve conter a identificação do funcionário responsável pelo registro, bem com os dados do aluno e turmas. Para uma disciplina podemos ter diversas turmas, mas apenas um professor responsável por ela.

#### Figura 2: Diagrama de Classes do Sistema.
 
![image](https://github.com/user-attachments/assets/abc7591a-b46f-4ea2-b8f0-c116b60eb24e)


### 3.4.4 Descrições das Classes  

| # | Nome                | Descrição                                                                 |
|---|---------------------|---------------------------------------------------------------------------|
| 1 | Usuário             | Representa os indivíduos ou organizações que utilizam o sistema.          |
| 2 | Administrador       | Especialização de Usuário, responsável por gerenciar dados e cadastros.   |
| 3 | PontoDeColeta       | Cadastro dos pontos de coleta disponíveis, com localização e detalhes.    |
| 4 | Resíduo             | Tipos de resíduos aceitos nos pontos de coleta.                           |
| 5 | Avaliação           | Registro de comentários e notas fornecidas pelos usuários sobre os pontos.|
| 6 | Notificação         | Mensagens enviadas aos usuários sobre atualizações e alertas.             |
| 7 | Recompensa          | Benefícios que podem ser resgatados pelos usuários com base em pontos.    |
| 8 | SistemaDePontuação  | Controle da pontuação acumulada pelos usuários a partir de descartes.     |

