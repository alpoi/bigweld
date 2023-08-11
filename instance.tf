locals {
  bigweld_config = file("${path.module}/src/config.json")
}

resource "aws_instance" "instance" {
  ami           = "ami-0f3d9639a5674d559"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.keypair.key_name

  vpc_security_group_ids = [aws_security_group.sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install docker -y
              sudo yum install git -y
              sudo service docker start
              sudo usermod -a -G docker ec2-user
              git clone https://github.com/alpoi/bigweld.git
              cd bigweld
              echo '${data.template_file.dockerfile.rendered}' > Dockerfile
              echo '${local.bigweld_config}' > ./src/config.json
              docker build -t bigweld .
              docker run -d -p 80:80 bigweld
              EOF
}

resource "aws_security_group" "sg" {
  name_prefix = "bigweld_sg_"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "template_file" "dockerfile" {
  template = <<-EOF
    FROM node

    WORKDIR /app

    COPY package.json package-lock.json tsconfig.json ./

    RUN npm install

    COPY ./src ./src

    RUN npm run build
    RUN npm run register

    EXPOSE 80

    CMD ["npm", "run", "start"]
  EOF
}