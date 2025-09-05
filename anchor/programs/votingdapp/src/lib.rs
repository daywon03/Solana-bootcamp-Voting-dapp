#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod votingdapp {
    use super::*;

    //FONCTION Initialisation sondage (poll)------------------------------
    pub fn initialize_poll(ctx : Context<InitializePoll>,
                            poll_id: u64,
                            description: String,
                            poll_start: u64,
                            poll_end: u64,
                            ) -> Result<()> {
      let poll = &mut ctx.accounts.poll; //fait réferences à la struct poll
      //constructeur un peu
      poll.poll_id = poll_id;
      poll.description = description;
      poll.poll_start = poll_start;
      poll.poll_end = poll_end; 
      poll.candidate_amount = 0; //initialise a 0 
      Ok(())
    }
    
    //FONCTION Initialisation candidat (candidate)------------------------------
    pub fn initialise_candidate(ctx : Context<InitializeCandidate>,
                                candidate_name: String, 
                                _poll_id: u64, //It will never be used so we put _ in front
                                ) ->Result<()>{
      let candidate = &mut ctx.accounts.candidate;
      let poll = &mut ctx.accounts.poll;
      poll.candidate_amount += 1;
      candidate.candidate_name = candidate_name;
      candidate.candidate_votes = 0;
      Ok(())                           
                                }


    pub fn vote(ctx : Context<Vote>,
                _candidate_name : String,
                _poll_id : u64,
               ) -> Result<()>{
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_votes += 1;
        msg!("voted for candidate: {}", candidate.candidate_name);
        msg!("vote:{}", candidate.candidate_votes);
        Ok(())
        }
}

//Struct vote
#[derive(Accounts)]
#[instruction(candidate_name:String, poll_id:u64)]
pub struct Vote<'info> {
    pub signer: Signer<'info>,

    #[account(
      seeds = [poll_id.to_le_bytes().as_ref()],
      bump
    )]
    pub poll: Account<'info, Poll>,

    #[account( 
      mut,
      seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()], //#instruction pour pouvoir l'utiliser ici
      bump,
  )]

    pub candidate: Account<'info, Candidate>,

}


// Struct InitializePoll
#[derive(Accounts)]
#[instruction(poll_id: u64)] //Sert a la création de la seeds et fait référence au donnée poll_id
pub struct InitializePoll<'info> {
  //Parce que on vas avoir de l'argent du signeur account(mut)
  #[account(mut)]
  pub signer: Signer<'info>, //Création d'une variable signer "la personne qui vas crée le sondage qui vas donc payer" ref <'info>
  #[account( //Création du compte poll(sondage) besoin de init pour init
    init,
    payer = signer,
    space = 8 + Poll::INIT_SPACE, //gérer l'espace, commence toujours par 8
    seeds = [poll_id.to_le_bytes().as_ref()],//crée la seeds de poll_id pour le compte poll, sert a pouvoir l'appeler c'est comme une addresse
    bump,
  )]
  pub poll: Account<'info, Poll>,

  pub system_program: Program<'info, System>,
}

// Struct InitializeCandidate
#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)] //Doit être dans le même ordre que initialize dans la fonctions
pub struct InitializeCandidate<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,

  //Pout incrémenter le nombre de candidats dans Poll
  #[account( //utilise l'account Poll sorte de ref
    mut,
    seeds = [poll_id.to_le_bytes().as_ref()],//crée la seeds de poll_id pour le compte poll, sert a pouvoir l'appeler c'est comme une addresse
    bump,
  )]
  pub poll: Account<'info, Poll>,

  #[account( //création d'un nouvelle account
    init,
    payer = signer,
    space = 8 + Candidate::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()], //#instruction pour pouvoir l'utiliser ici
    bump,
  )]
  pub candidate: Account<'info, Candidate>,
  pub system_program: Program<'info, System>,

}

#[account] //création des paramètre du compte
#[derive(InitSpace)]
pub struct Poll{ //paramètre du compte poll (sondage)
  pub poll_id: u64,
  #[max_len(280)] //taille max de la description
  pub description: String,
  pub poll_start: u64,
  pub poll_end: u64,
  pub candidate_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate{
  #[max_len(32)] //Because i use a string
  pub candidate_name: String,
  pub candidate_votes: u64,
}