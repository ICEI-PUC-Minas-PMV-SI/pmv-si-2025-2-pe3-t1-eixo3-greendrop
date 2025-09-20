# 3. DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE

Nesta parte do trabalho você deve detalhar a documentação dos requisitos do sistema proposto de acordo com as seções a seguir. Ressalta-se que aqui é utilizado como exemplo um sistema de gestão de cursos de aperfeiçoamento.

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

| Código | Requisito Não Funcional (Restrição)                                                                 |
|--------|-----------------------------------------------------------------------------------------------------|
| RNF1   | O sistema deve garantir tempo de resposta inferior a 2 segundos em todas as operações principais.    |
| RNF2   | O sistema deve ser responsivo, funcionando corretamente em desktops, tablets e dispositivos móveis. |
| RNF3   | O sistema deve permitir autenticação de usuários através de credenciais (login e senha).            |
| RNF4   | O sistema deve registrar logs de acesso com data, hora e identificação do usuário.                  |
| RNF5   | O sistema deve suportar no mínimo 50 usuários simultâneos sem perda perceptível de desempenho.      |
| RNF6   | O sistema deve estar disponível 99% do tempo, considerando o período mensal.                        |


### 3.3.3 Usuários  

| Ator                     | Descrição |
|---------------------------|-----------|
| **Administrador**         | Responsável pela gestão geral da plataforma (cadastro de pontos, usuários e conteúdos educativos). |
| **Organização/Ponto de Coleta** | Entidades que cadastram seus pontos de coleta, atualizam informações e interagem com usuários. |
| **Usuário Final (Indivíduo)**   | Cidadão que busca pontos de coleta, acessa informações educativas e pode interagir com pontos de coleta. |

## 3.4 Modelagem do Sistema

### 3.4.1 Diagrama de Casos de Uso
Como observado no diagrama de casos de uso da Figura 1, a secretária poderá gerenciar as matrículas e professores no sistema, enquanto o coordenador, além dessas funções, poderá gerenciar os cursos de aperfeiçoamento.

#### Figura 1: Diagrama de Casos de Uso do Sistema.

![dcu](https://github.com/user-attachments/assets/41f6b731-b44e-43aa-911f-423ad6198f47)
 
### 3.4.2 Descrições de Casos de Uso

Cada caso de uso deve ter a sua descrição representada nesta seção. Exemplo:

#### Gerenciar Professor (CSU01)

Sumário: A Secretária realiza a gestão (inclusão, remoção, alteração e consulta) dos dados sobre professores.

Ator Primário: Secretária.

Ator Secundário: Coordenador.

Pré-condições: A Secretária deve ser validada pelo Sistema.

Fluxo Principal:

1) 	A Secretária requisita manutenção de professores.
2) 	O Sistema apresenta as operações que podem ser realizadas: inclusão de um novo professor, alteração de um professor, a exclusão de um professor e a consulta de dados de um professor.
3) 	A Secretária seleciona a operação desejada: Inclusão, Exclusão, Alteração ou Consulta, ou opta por finalizar o caso de uso.
4) 	Se a Secretária desejar continuar com a gestão de professores, o caso de uso retorna ao passo 2; caso contrário o caso de uso termina.

Fluxo Alternativo (3): Inclusão

a)	A Secretária requisita a inclusão de um professor. <br>
b)	O Sistema apresenta uma janela solicitando o CPF do professor a ser cadastrado. <br>
c)	A Secretária fornece o dado solicitado. <br>
d)	O Sistema verifica se o professor já está cadastrado. Se sim, o Sistema reporta o fato e volta ao início; caso contrário, apresenta um formulário em branco para que os detalhes do professor (Código, Nome, Endereço, CEP, Estado, Cidade, Bairro, Telefone, Identidade, Sexo, Fax, CPF, Data do Cadastro e Observação) sejam incluídos. <br>
e)	A Secretária fornece os detalhes do novo professor. <br>
f)	O Sistema verifica a validade dos dados. Se os dados forem válidos, inclui o novo professor e a grade listando os professores cadastrados é atualizada; caso contrário, o Sistema reporta o fato, solicita novos dados e repete a verificação. <br>

Fluxo Alternativo (3): Remoção

a)	A Secretária seleciona um professor e requisita ao Sistema que o remova. <br>
b)	Se o professor pode ser removido, o Sistema realiza a remoção; caso contrário, o Sistema reporta o fato. <br>

Fluxo Alternativo (3): Alteração

a)	A Secretária altera um ou mais dos detalhes do professor e requisita sua atualização. <br>
b)	O Sistema verifica a validade dos dados e, se eles forem válidos, altera os dados na lista de professores, caso contrário, o erro é reportado. <br>
 
Fluxo Alternativo (3): Consulta

a)	A Secretária opta por pesquisar pelo nome ou código e solicita a consulta sobre a lista de professores. <br>
b)	O Sistema apresenta uma lista professores. <br>
c)	A Secretária seleciona o professor. <br>
d)	O Sistema apresenta os detalhes do professor no formulário de professores. <br>

Pós-condições: Um professor foi inserido ou removido, seus dados foram alterados ou apresentados na tela.

### 3.4.3 Diagrama de Classes 

A Figura 2 mostra o diagrama de classes do sistema. A Matrícula deve conter a identificação do funcionário responsável pelo registro, bem com os dados do aluno e turmas. Para uma disciplina podemos ter diversas turmas, mas apenas um professor responsável por ela.

#### Figura 2: Diagrama de Classes do Sistema.
 
![image](https://github.com/user-attachments/assets/abc7591a-b46f-4ea2-b8f0-c116b60eb24e)


### 3.4.4 Descrições das Classes 

| # | Nome | Descrição |
|--------------------|------------------------------------|----------------------------------------|
| 1	|	Aluno |	Cadastro de informações relativas aos alunos. |
| 2	| Curso |	Cadastro geral de cursos de aperfeiçoamento. |
| 3 |	Matrícula |	Cadastro de Matrículas de alunos nos cursos. |
| 4 |	Turma |	Cadastro de turmas.
| 5	|	Professor |	Cadastro geral de professores que ministram as disciplinas. |
| ... |	... |	... |
