import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp' //types Votingdapp
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { buffer } from 'stream/consumers';

const IDL = require('../target/idl/votingdapp.json');
//Address de notre voting smartcontract dans lib.rs
const votingAddress = new PublicKey("2S87HD2Us6gGTPhU9fPtqYhVSsxML8VRdXYMU14VPAe4"); 


describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  let context;
  let provider;
  let votingProgram: anchor.Program<Votingdapp>;
  anchor.setProvider(anchor.AnchorProvider.env());

  beforeAll(async () => {
     //Init du contexte et du provider
   context = await startAnchor("http://localhost:8899",[{name: "votingdapp", programId: votingAddress}], []);
   provider = new BankrunProvider(context);

  //Init du program object en utilisant le program type Votingdapp
   votingProgram = new Program<Votingdapp>(
    IDL,
    provider,
  );
  })


  it('Initialize Poll', async () => { //initialisation de Initialize Poll pour le test
    //Initialisation de la methode initializepoll pour la tester
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
     "What is your favorite type of nutella?",
      new anchor.BN(0),
      new anchor.BN(1839272424),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )
  
    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite type of nutella?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('Initialize Candidate', async () => {
 
    await votingProgram.methods.initialiseCandidate(
      "Oscar",
      new anchor.BN(1),
    ).rpc();

    await votingProgram.methods.initialiseCandidate(
      "Crunch",
      new anchor.BN(1),
    ).rpc();

    const [candidateAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Oscar")], //Bien mettre dans l'ordre les infos 
      votingAddress,
    )

    const candidate = await votingProgram.account.candidate.fetch(candidateAdress);
    console.log(candidate);
    expect(candidate.candidateVotes.toNumber()).toEqual(0)

    const [CrunchcandidateAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunch")], //Bien mettre dans l'ordre les infos 
      votingAddress,
    )

    const Crunchcandidate = await votingProgram.account.candidate.fetch(CrunchcandidateAdress);
    console.log(Crunchcandidate);
    expect(Crunchcandidate.candidateVotes.toNumber()).toEqual(0)


  })

  it("vote", async() => {
    await votingProgram.methods
    .vote(
      "Oscar",
      new anchor.BN(1),
    ).rpc();

    const [candidateAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Oscar")], //Bien mettre dans l'ordre les infos 
      votingAddress,
    )

    const candidate = await votingProgram.account.candidate.fetch(candidateAdress);
    console.log(candidate);
    expect(candidate.candidateVotes.toNumber()).toEqual(1)

  });
 
})
