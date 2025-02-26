'use client';

import { Link, Book, Video, Database, Users, Newspaper, Github } from 'lucide-react';

export function AdditionalResources() {
  return (
    <div className="space-y-6 px-4">
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Paper Sources</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
        <li>
            <a
              href="https://huggingface.co/spaces/huggingface/paper-central"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Hugging Face Paper Central
            </a>
          </li>
          <li>
            <a
              href="https://arxiv.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              arXiv
            </a>
          </li>
          <li>
            <a
              href="https://www.semanticscholar.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Semantic Scholar
            </a>
          </li>
          <li>
            <a
              href="https://www.biorxiv.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              bioRxiv
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Blogs</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
          <li>
            <a
              href="https://lilianweng.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Lilian Weng&apos;s Blog
            </a>
          </li>
          <li>
            <a
              href="https://karpathy.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Andrej Karpathy&apos;s Blog
            </a>
          </li>
          <li>
            <a
              href="https://deepmind.google/discover/blog/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              DeepMind Research Blog
            </a>
          </li>
          <li>
            <a
              href="https://ai.meta.com/blog/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              AI@Meta Blog
            </a>
          </li>
          <li>
            <a
              href="https://www.microsoft.com/en-us/research/blog/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Microsoft Research Blog
            </a>
          </li>
          <li>
            <a
              href="https://blogs.nvidia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              NVidia Research Blog
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Tutorials</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
        <li>
            <a
              href="https://jax-ml.github.io/scaling-book/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              DeepMind: Scaling Book - How To Scale Your Model
            </a>
          </li>
        <li>
            <a
              href="https://huggingface.co/spaces/nanotron/ultrascale-playbook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              The Ultra-Scale Playbook: Training LLMs on GPU Clusters
            </a>
          </li>
          <li>
            <a
              href="https://colab.research.google.com/drive/1bfhs1FMLW3FGa8ydvkOZyBNxLYOu0Hev?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Training a Small Math Reasoner with RL (GRPO)
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Jiayi-Pan/TinyZero"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Tiny Zero - Reproduce DeepSeek-R1-Zero for $30
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Github className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Github Repositories</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
          <li>
            <a
              href="https://github.com/huggingface/transformers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Hugging Face Transformers
            </a>
          </li>
          <li>
            <a
              href="https://github.com/huggingface/diffusers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Hugging Face Diffusers
            </a>
          </li>
          <li>
            <a
              href="https://github.com/pytorch/pytorch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              PyTorch
            </a>
          </li>
          <li>
            <a
              href="https://github.com/openai/whisper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              OpenAI Whisper
            </a>
          </li>
          <li>
            <a
              href="https://github.com/AUTOMATIC1111/stable-diffusion-webui"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Stable Diffusion WebUI
            </a>
          </li>
          <li>
            <a
              href="https://github.com/microsoft/DeepSpeed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Microsoft DeepSpeed
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Conferences</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
          <li>
            <a
              href="https://nips.cc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              NeurIPS (Neural Information Processing Systems)
            </a>
          </li>
          <li>
            <a
              href="https://icml.cc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              ICML (International Conference on Machine Learning)
            </a>
          </li>
          <li>
            <a
              href="https://iclr.cc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              ICLR (International Conference on Learning Representations)
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Book className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Learning Resources</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
          <li>
            <a
              href="https://huggingface.co/learn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Hugging Face Course
            </a>
          </li>
          <li>
            <a
              href="https://pytorch.org/tutorials/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              PyTorch Tutorials
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Video Lectures</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
          <li>
            <a
              href="https://www.youtube.com/@YannicKilcher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Yannic Kilcher&apos;s Paper Reviews
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/@AndrejKarpathy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Andrej Karpathy&apos;s ML Tutorials
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Useful Links</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
          <li>
            <a
              href="https://paperswithcode.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Papers with Code
            </a>
          </li>
          <li>
            <a
              href="https://scholar.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Google Scholar
            </a>
          </li>
          <li>
            <a
              href="https://www.connectedpapers.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Connected Papers
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}