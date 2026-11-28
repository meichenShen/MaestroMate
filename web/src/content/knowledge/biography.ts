import type { ReferenceId } from "./sources";

// Third-person factual introduction, separate from the imagined Chat persona.
// Reviewed against Paris Opera's biography and the BnF exhibition dossier.
export const composerBiography: {
  title: string;
  text: string;
  sourceIds: ReferenceId[];
}[] = [
  {
    title: "A childhood at the piano",
    text: "Born in Paris in 1835, Saint-Saëns played piano as a child. He later studied at the Paris Conservatoire and won its first prize for organ in 1851. Piano and organ both became important parts of his career.",
    sourceIds: ["biography"],
  },
  {
    title: "Twenty years at the organ",
    text: "From 1857 to 1877, he was organist at La Madeleine in Paris. He was a performer as well as a composer: alongside writing music, he played piano and organ for audiences.",
    sourceIds: ["biography"],
  },
  {
    title: "A teacher of other composers",
    text: "He taught piano at the École Niedermeyer from 1861 to 1865. Gabriel Fauré was one of his pupils. In 1871, Saint-Saëns also helped found a society that supported the performance of French music.",
    sourceIds: ["biography"],
  },
  {
    title: "Animals, music and jokes",
    text: "The Carnival of the Animals began as music for a private gathering in 1886. Its fourteen movements include Aquarium and The Swan. Most of it was not published during his lifetime; The Swan was an exception.",
    sourceIds: ["history", "score"],
  },
  {
    title: "Beyond Aquarium",
    text: "His other works include the opera Samson et Dalila, the orchestral Danse macabre and Symphony No. 3, which includes an organ. He also wrote five piano concertos. These offer quite different starting points for hearing his music.",
    sourceIds: ["biography"],
  },
  {
    title: "Music for the cinema",
    text: "In 1908, Saint-Saëns wrote music for The Assassination of the Duke of Guise. So his work reached beyond churches, concert halls and opera into cinema. This film score is a different work from Aquarium.",
    sourceIds: ["biography"],
  },
];
