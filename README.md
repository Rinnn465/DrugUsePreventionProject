<body>

<h1>Drug Use Prevention Platform</h1>

<div>
  <h2>Table of contents</h3>
  <ul>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#feature">Features</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#folder-structure">Folder structure</a></li>
    <li><a href="#set-up">Setup and installation</a></li>
    <li><a href="#running">Running application</a></li>
    <li><a href="#frontend-details">Frontend details</a></li>
    <li><a href="#backend-details">Backend details</a></li>
    <li><a href="#license">License</a></li>
  </ul>
</div>


<div>

  <h2 id="overview">Overview</h3>
  <p>
    With the current situation of the age of drug use starting to get younger rapidly, we decided to create a web platform where
    people can learn more about the harmful effects of drugs, and take quizzes to assess an individual's risk of drug use.
    In addition, our platform also provides users with free courses on drug use prevention, opportunities to meet and chat
    with experts to answer questions surrounding drug use.
  </p>

  <h1></h1>
  
  <h2 id="feature">Features</h3>
  <div>
      <b>Educational courses:</b> 
      <span>Members partcipating in the system's courses may gain access to comprehensive lessons as well as final exams at the end of every course.</span>
      <div></div>
      <b>Online consultation:</b>
      <span>Our system offers online meetings with professional consultants in drug use prevention field.</span>
      <div></div>
      <b>Community programs:</b>
      <span>By hosting and organizing community programs for every members of the system, we desired to raise people awareness about the danger of using drugs and their consequences. </span>
  </div>
  <h2 id="tech-stack">Tech Stack</h2>
  <ul>
    <li>Frontend Tech: Vite + ReactJS, Formik, Yup, Tailwind, TypeScript, React Router, tippyjs/react, lucide-react, axios, agora, react-toastify</li>
    <li>Backend Tech: Node.js, TypeScript, Express.js, EJS, jsonwebtoken, bcrypt / bcryptjs, cors, mssql, agora, nodemon </li>
  </ul>
  <h1></h1>

  <h2 id="folder-structure">Folder structure</h2>

  ```bash
├─ · client/
│    └──   assets/
│    └──   components/
│    └──   context/
│    └──   config/
│    └──   data/
│    └──   hooks/
│    └──   pages/
│    └──   types/
│    └──   utils/
│    └──   App.tsx
│    └──   ...
├─ · server/
│    └──   config/
│    └──   controllers/
│    └──   middleware/
│    └──   routes/
│    └──   templates/
│    └──   types/
│    └──   app.ts
│    └──   ...
│    └──   ...
├─ · README.md
├─ · ...
├─ · ...
  ```



<h1 id="set-up">Setup and Installation</h2>
<h2>Prerequisites</h3>
  <ul>
    <li>Nodejs (v18+ or later)</li>
    <li>npm or yarn</li>
  </ul>

<h2>Setup and installation</h3>
<div>
  Download SQL server database to your local via this link: 
  <pre><code>https://drive.google.com/file/d/1Goyf3wTMaTJQoynCbK33RzxoLfTmqVGt/view?usp=sharing</code></pre>
</div>
<ul>
   <li>1. Clone or download the project from github</li>
   <li>2. Open command prompt and check whether node is installed on your computer by this command</li>
</ul> 
<pre>
<code>node -v </code>
#should output a number  
</pre>


<h1 id="running">Running appilcation</h1>
<h2 id="frontend-details">
  Frontend installation and running  
</h2>
<ul>
  <li>
  1. Navigate to frontend directory
  </li>
    <pre><code>cd client/</code></pre>
  <li>
  2. Install missing dependencies
  </li>
    <pre><code>npm i</code></pre>
  <li>
  3. After installtion, run frontend by this command 
  </li>
    <pre><code>npm run dev</code></pre>
  <li>
    4. Press <pre>Ctrl + O</pre> to open the project on browser
  </li>
  </ul>

  Frontend runs on port 5173 by default with the address: <pre>http://localhost:5173</pre>
</div>

<h2 id="backend-details">
  Backend installation and running  
</h2>
<ul>
  <li>
  1. Navigate to backend directory
  </li>
    <pre><code>cd server/</code></pre>
  <li>
  2. Install missing dependencies
  </li>
    <pre><code>npm i</code></pre>
  <li>
  3. After installtion, run backend by this command 
  </li>
    <pre><code>npm run dev</code></pre>
  <li>
  3. Once the the message "Connected to SQL server..." is printed out in the terminal, backend is ready for services
  </li>
</ul>
Backend runs on port 5000 by default with the address: <pre>http://localhost:5000</pre>

</div>



</body>

